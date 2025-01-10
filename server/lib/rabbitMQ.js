const amqp = require("amqplib");

let connection, channel;

const connectToRabbitMQ = async () => {
  try {
    const rabbitMQUrl = process.env.RABBITMQ_URL || "amqp://localhost";
    connection = await amqp.connect(rabbitMQUrl);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    throw error;
  }
};

const createQueue = async (queueName) => {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  await channel.assertQueue(queueName, { durable: true });
};

const sendMessage = (queueName, message) => {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  channel.sendToQueue(queueName, Buffer.from(message));
  console.log(`Message sent to queue "${queueName}": ${message}`);
};

const consumeMessages = (queueName, onMessage) => {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Call connectToRabbitMQ first."
    );
  }
  channel.consume(
    queueName,
    (msg) => {
      if (msg) {
        console.log(
          `Message received from queue "${queueName}": ${msg.content.toString()}`
        );
        onMessage(msg.content.toString());
        channel.ack(msg);
      }
    },
    { noAck: false }
  );
};

const closeConnection = async () => {
  if (connection) {
    await connection.close();
    console.log("RabbitMQ connection closed");
  }
};

module.exports = {
  connectToRabbitMQ,
  createQueue,
  sendMessage,
  consumeMessages,
  closeConnection,
};
