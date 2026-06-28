import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

const CAMP_ID = "6a3e3ff7c93fcb99cf20e47c";
const BATCH_SIZE = 10000;
const TOTAL_CLICKS = parseInt(process.argv.find(a => a.startsWith("--count="))?.split("=")[1] || "500000", 10);
const START_VU = 0;
const MAX_VU = Math.ceil(TOTAL_CLICKS / 100) - 1;

async function main() {
  await mongoose.connect(process.env.DB_URL, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");

  const campaign = await mongoose.connection.db.collection("campaigns").findOne({ _id: new mongoose.Types.ObjectId(CAMP_ID) });
  if (!campaign) {
    console.error("Campaign not found:", CAMP_ID);
    process.exit(1);
  }
  console.log("Campaign found:", campaign.name || CAMP_ID);

  const Click = mongoose.connection.db.collection("clicks");
  const existingCount = await Click.countDocuments({ campId: new mongoose.Types.ObjectId(CAMP_ID) });
  console.log(`Existing clicks for campaign: ${existingCount}`);

  let inserted = 0;
  let batch = [];

  for (let vu = START_VU; vu <= MAX_VU && inserted < TOTAL_CLICKS; vu++) {
    for (let iter = 0; iter < 100 && inserted < TOTAL_CLICKS; iter++) {
      batch.push({
        userId: campaign.userId,
        campId: campaign._id,
        click: `k6_${vu}_${iter}`,
        user: "9999999900",
        refer: "9999999901",
        ip: "10.0.0.1",
        number: "1",
        device: {},
        params: {},
        createdAt: new Date(),
      });
      inserted++;

      if (batch.length >= BATCH_SIZE) {
        await Click.insertMany(batch, { ordered: false });
        batch = [];
        console.log(`Inserted ${inserted} / ${TOTAL_CLICKS} clicks`);
      }
    }
  }

  if (batch.length > 0) {
    await Click.insertMany(batch, { ordered: false });
    console.log(`Inserted ${inserted} / ${TOTAL_CLICKS} clicks`);
  }

  const lastVu = Math.floor((inserted - 1) / 100);
  const lastIter = (inserted - 1) % 100;
  console.log(`\nDone! Total clicks for campaign ${CAMP_ID}: ${inserted}`);
  console.log(`Click ID range: k6_${START_VU}_0 to k6_${lastVu}_${lastIter}`);

  await Click.createIndex({ click: 1, userId: 1 });
  console.log("Index { click: 1, userId: 1 } ensured");

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
