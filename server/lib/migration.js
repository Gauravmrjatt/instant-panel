const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Campaign = require("../modules/campaigns/model");
require("dotenv").config();
const logger = require("./logger");

async function migrate() {
  try {
    await mongoose.connect(process.env.DB_URL);
    logger.info("Connected to database for migration...");

    const campaigns = await Campaign.find({
      $or: [{ postbackToken: { $exists: false } }, { postbackToken: null }],
    });

    logger.info({ count: campaigns.length }, "Campaigns to update");

    for (const camp of campaigns) {
      camp.postbackToken = uuidv4();
      await camp.save();
      logger.info({ campaign: camp.name, id: camp._id }, "Updated campaign");
    }

    logger.info("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Migration failed");
    process.exit(1);
  }
}

migrate();
