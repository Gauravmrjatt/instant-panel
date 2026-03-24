const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Campaign = require("../models/Campaigns");
require("dotenv").config();

async function migrate() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to database for migration...");

    const campaigns = await Campaign.find({
      $or: [{ postbackToken: { $exists: false } }, { postbackToken: null }],
    });

    console.log(`Found ${campaigns.length} campaigns to update.`);

    for (const camp of campaigns) {
      camp.postbackToken = uuidv4();
      await camp.save();
      console.log(`Updated campaign: ${camp.name} (${camp._id})`);
    }

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
