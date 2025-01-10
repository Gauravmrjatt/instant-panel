const {
  connectToRabbitMQ,
  consumeMessages,
  createQueue,
} = require("../lib/rabbitMQ");
const { ObjectId } = require("mongodb");
const PendingPayment = require("../models/PendingPayments");
const Leads = require("../models/Leads");
const handelPayment = require("../lib/handelPayments");

const QUEUE_NAME = "payment_processing";

(async () => {
  try {
    // Connect to RabbitMQ
    await connectToRabbitMQ();
    console.log("Worker connected to RabbitMQ.");
    await createQueue(QUEUE_NAME);
    // Consume messages from the queue
    await consumeMessages(QUEUE_NAME, async (taskString) => {
      const task = JSON.parse(taskString);
      const { userId, value, totalAmount, comment, clicks, campId } = task;

      try {
        // Handle payment
        const payment = await handelPayment(
          userId,
          value,
          totalAmount,
          comment
        );
        console.log(payment);
        const status = payment.status;
        const payMessage =
          payment.statusMessage ||
          payment.message ||
          payment.msg ||
          "no message found";

        // Update payments and leads
        await Promise.all([
          PendingPayment.updateMany(
            {
              userId: new ObjectId(userId),
              status: { $in: ["PENDING", "ACCEPTED"] },
              type: "refer",
              paymentStatus: { $nin: ["ACCEPTED"] },
              campId: new ObjectId(campId),
              clickId: { $in: clicks },
            },
            {
              status: "ACCEPTED",
              paymentStatus: status,
              payMessage,
              message:
                "We have processed your request; please check payment status",
              response: payment,
            }
          ),
          Leads.updateMany(
            {
              userId: new ObjectId(userId),
              status: "Approved",
              referPaymentStatus: "PENDING",
              campId: new ObjectId(campId),
              clickId: { $in: clicks },
            },
            {
              referPaymentStatus: status,
              referPayMessage: payMessage,
            }
          ),
        ]);

        console.log(
          `PayentWorker >> Processed task for userId: ${value}, totalAmount: ${totalAmount}`
        );
      } catch (err) {
        console.error("PayentWorker >> Error processing task:", err);
      }
    });
  } catch (error) {
    console.error(
      "PayentWorker >> Worker failed to connect to RabbitMQ:",
      error
    );
  }
})();
