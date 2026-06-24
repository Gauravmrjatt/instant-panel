const amqp = require("amqplib");
const EventEmitter = require("events");

let connection = null;
let channel = null;
let connecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_BASE_DELAY = 1000;

const channelEmitter = new EventEmitter();

// Track consumers for re-registration on reconnect
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
    const rabbitMQUrl = process.env.RABBITMQ_URL || "amqp://localhost";
    connection = await amqp.connect(rabbitMQUrl);

    connection.on("close", async () => {
      console.log("RabbitMQ connection closed");
      connection = null;
      channel = null;
      channelEmitter.emit("connection_lost");
      await reconnect();
    });

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
    });

    reconnectAttempts = 0;
    console.log("Connected to RabbitMQ");
    return connection;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
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
      console.log(`Re-registered consumer for queue: ${queue}`);
    } catch (err) {
      console.error(`Failed to re-register consumer for ${queue}:`, err.message);
    }
  }
}

async function reconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error("Max reconnect attempts reached");
    return;
  }
  reconnectAttempts++;
  const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts - 1);
  console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
  await new Promise((resolve) => setTimeout(resolve, delay));
  try {
    await getConnection();
    await getChannel();
    await reRegisterConsumers();
    channelEmitter.emit("reconnected");
    console.log("RabbitMQ reconnected and consumers restored");
  } catch (err) {
    console.error("Reconnect failed:", err.message);
    reconnect();
  }
}

async function getChannel() {
  if (channel) return channel;
  const conn = await getConnection();
  channel = await conn.createChannel();
  channel.on("error", (err) => {
    console.error("RabbitMQ channel error:", err.message);
    channelEmitter.emit("channel_error", err);
  });
  return channel;
}

async function connectToRabbitMQ() {
  await getConnection();
  await getChannel();
}

async function createQueue(queueName) {
  const ch = await getChannel();
  await ch.assertQueue(queueName, { durable: true });
}

async function assertQueues() {
  const ch = await getChannel();
  await Promise.all([
    ch.assertQueue("click_buffer", { durable: true }),
    ch.assertQueue("payment_processing", { durable: true }),
    ch.assertQueue("dead_letter", { durable: true }),
    ch.assertQueue("lead_write", { durable: true }),
  ]);
}

function sendToQueue(queueName, message) {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  channel.sendToQueue(queueName, Buffer.from(message));
}

function sendMessage(queueName, message) {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  channel.sendToQueue(queueName, Buffer.from(message));
  console.log(`Message sent to queue "${queueName}": ${message}`);
}

function consumeMessages(queueName, onMessage) {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  const handler = (msg) => {
    if (msg) {
      console.log(
        `Message received from queue "${queueName}": ${msg.content.toString()}`
      );
      onMessage(msg.content.toString());
      channel.ack(msg);
    }
  };
  channel.consume(queueName, handler, { noAck: false });
  consumers.push({ queue: queueName, handler });
}

async function closeConnection() {
  if (channel) {
    await channel.close();
    channel = null;
  }
  if (connection) {
    await connection.close();
    connection = null;
    console.log("RabbitMQ connection closed");
  }
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
  channelEmitter,
};
