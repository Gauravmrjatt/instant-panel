const {
  connectToRabbitMQ,
  consumeMessages,
  createQueue,
} = require("../../lib/rabbitMQ");
const mongoose = require("mongoose");
const PendingPayment = require("../../modules/payments/model").PendingPayment;
const Leads = require("../../modules/leads/model");
const handelPayment = require("../../lib/handelPayments");

const QUEUE_NAME = "payment_processing";

(async () => {
  try {
    await connectToRabbitMQ();
    console.log("Worker connected to RabbitMQ.");
    await createQueue(QUEUE_NAME);
    await consumeMessages(QUEUE_NAME, async (taskString) => {
      const task = JSON.parse(taskString);
      const { userId, value, totalAmount, comment, clicks, campId } = task;

      try {
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

        await Promise.all([
          PendingPayment.updateMany(
            {
              userId: new mongoose.Types.ObjectId(userId),
              status: { $in: ["PENDING", "ACCEPTED"] },
              type: "refer",
              paymentStatus: { $nin: ["ACCEPTED"] },
              campId: new mongoose.Types.ObjectId(campId),
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
              userId: new mongoose.Types.ObjectId(userId),
              status: "Approved",
              referPaymentStatus: "PENDING",
              campId: new mongoose.Types.ObjectId(campId),
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
