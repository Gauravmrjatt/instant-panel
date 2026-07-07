const amqp = require("amqplib");
const EventEmitter = require("events");
const logger = require("./logger");

let connection = null;
let channel = null;
let connecting = false;
let reconnectAttempts = 0;
let shuttingDown = false;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_BASE_DELAY = 1000;

const channelEmitter = new EventEmitter();

const consumers = [];

async function getConnection() {
  if (connection && connection.connection && connection.connection._open) {
    return connection;
  }
  if (connecting) {
    await new Promise((resolve) => {
      const check = () => {
        if (!connecting) resolve();
        else setTimeout(check, 100);
      };
      check();
    });
    if (connection) return connection;
  }

  connecting = true;
  try {
    let rabbitMQUrl = process.env.RABBITMQ_URL || "amqp://localhost";
    if (!rabbitMQUrl.includes("heartbeat=")) rabbitMQUrl += (rabbitMQUrl.includes("?") ? "&" : "?") + "heartbeat=30";
    connection = await amqp.connect(rabbitMQUrl);

    connection.on("close", async () => {
      logger.info("RabbitMQ connection closed");
      connection = null;
      channel = null;
      channelEmitter.emit("connection_lost");
      if (!shuttingDown) await reconnect();
    });

    connection.on("error", (err) => {
      logger.error({ err: err.message }, "RabbitMQ connection error");
    });

    reconnectAttempts = 0;
    logger.info("Connected to RabbitMQ");
    return connection;
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to RabbitMQ");
    connection = null;
    throw error;
  } finally {
    connecting = false;
  }
}

async function reRegisterConsumers() {
  for (const { queue, handler } of consumers) {
    try {
      await channel.assertQueue(queue, { durable: true });
      channel.consume(queue, handler, { noAck: false });
      logger.info({ queue }, "Re-registered consumer for queue");
    } catch (err) {
      logger.error({ queue, err: err.message }, "Failed to re-register consumer");
    }
  }
}

async function reconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error("Max reconnect attempts reached");
    return;
  }
  reconnectAttempts++;
  const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts - 1);
  logger.info({ delay, attempt: reconnectAttempts }, "RabbitMQ reconnecting");
  await new Promise((resolve) => setTimeout(resolve, delay));
  try {
    await getConnection();
    await getChannel();
    await reRegisterConsumers();
    channelEmitter.emit("reconnected");
    logger.info("RabbitMQ reconnected and consumers restored");
  } catch (err) {
    logger.error({ err: err.message }, "Reconnect failed");
    reconnect();
  }
}

async function getChannel() {
  if (channel) return channel;
  const conn = await getConnection();
  channel = await conn.createChannel();
  channel.on("error", (err) => {
    logger.error({ err: err.message }, "RabbitMQ channel error");
    channelEmitter.emit("channel_error", err);
  });
  channel.on("close", () => {
    channel = null;
  });
  return channel;
}

async function connectToRabbitMQ() {
  await getConnection();
  await getChannel();
}

async function createQueue(queueName) {
  const ch = await getChannel();
  await initDLX();
  const dlxQueues = ["click_buffer", "payment_processing", "lead_write", "postback_processing"];
  const opts = dlxQueues.includes(queueName)
    ? { durable: true, deadLetterExchange: "dlx", deadLetterRoutingKey: `${queueName}_dlq` }
    : { durable: true };
  try {
    await ch.assertQueue(queueName, opts);
  } catch (err) {
    if (err.code === 406) {
      logger.warn({ queue: queueName }, "Queue exists without DLX — using durable only");
      channel = null;
      const newCh = await getChannel();
      await newCh.assertQueue(queueName, { durable: true });
    } else throw err;
  }
}

async function initDLX() {
  const ch = await getChannel();
  await ch.assertExchange("dlx", "direct", { durable: true });
  const dlqQueues = ["click_buffer", "payment_processing", "lead_write", "postback_processing"];
  await Promise.all(dlqQueues.map((q) =>
    ch.assertQueue(`${q}_dlq`, { durable: true }).then(() =>
      ch.bindQueue(`${q}_dlq`, "dlx", `${q}_dlq`)
    )
  ));
}

async function assertQueues() {
  const ch = await getChannel();
  await initDLX();
  const queues = [
    ["click_buffer", "click_buffer_dlq"],
    ["payment_processing", "payment_processing_dlq"],
    ["lead_write", "lead_write_dlq"],
    ["postback_processing", "postback_processing_dlq"],
  ];
  for (const [q, dlq] of queues) {
    try {
      await ch.assertQueue(q, { durable: true, deadLetterExchange: "dlx", deadLetterRoutingKey: dlq });
    } catch (err) {
      if (err.code === 406) {
        logger.warn({ queue: q }, "Queue exists without DLX — using durable only");
        channel = null;
        const newCh = await getChannel();
        await newCh.assertQueue(q, { durable: true });
      } else throw err;
    }
  }
}

function sendToQueue(queueName, message) {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  const ok = channel.sendToQueue(queueName, Buffer.from(message));
  if (ok === false) {
    throw new Error("sendToQueue returned false — channel is closing/closed");
  }
}

function sendMessage(queueName, message) {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  channel.sendToQueue(queueName, Buffer.from(message));
  logger.debug({ queue: queueName, message }, "Message sent to queue");
}

function consumeMessages(queueName, onMessage) {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  const handler = async (msg) => {
    if (!msg) return;
    try {
      await onMessage(msg.content.toString());
      try { channel.ack(msg); } catch { /* channel may be closed */ }
    } catch (err) {
      logger.error({ queue: queueName, err: err.message }, "Error processing message");
      const isConnErr = err?.message?.includes("PoolClosed") || err?.message?.includes("ClientClosed") || err?.code === 11000 || err?.message?.includes("closed");
      if (isConnErr) {
        try { channel.nack(msg, false, false); } catch {}
        return;
      }
      const headers = msg.properties?.headers || {};
      const retryCount = (headers["x-retry-count"] || 0) + 1;
      if (retryCount <= 3) {
        try {
          channel.sendToQueue(queueName, msg.content, {
            headers: { ...headers, "x-retry-count": retryCount },
            persistent: true,
          });
          channel.ack(msg);
          logger.warn({ queue: queueName, retryCount, err: err.message }, "Message requeued for retry");
        } catch {
          try { channel.nack(msg, false, false); } catch {}
        }
      } else {
        logger.error({ queue: queueName, retryCount: retryCount - 1, err: err.message }, "Max retries exceeded — sending to DLQ");
        try { channel.nack(msg, false, false); } catch {}
      }
    }
  };
  channel.consume(queueName, handler, { noAck: false });
  consumers.push({ queue: queueName, handler });
}

async function closeConnection() {
  shuttingDown = true;
  try {
    if (channel) { await channel.close(); }
  } catch { channel = null; }
  channel = null;
  try {
    if (connection) { await connection.close(); }
  } catch { connection = null; }
  connection = null;
  logger.info("RabbitMQ connection closed");
}

module.exports = {
  connectToRabbitMQ,
  createQueue,
  sendMessage,
  sendToQueue,
  consumeMessages,
  closeConnection,
  getConnection,
  getChannel,
  assertQueues,
  initDLX,
  channelEmitter,
};
