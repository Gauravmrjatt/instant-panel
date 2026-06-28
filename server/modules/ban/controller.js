const service = require("./service");
const logger = require("../../lib/logger");

async function getBanned(req, res) {
  try {
    const result = await service.getBannedNumbers(req.user.db._id);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function banNumber(req, res) {
  try {
    const userDetails = req.user.db;
    const result = await service.banNumber(userDetails._id, userDetails.userId, req.body.number);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function unban(req, res) {
  try {
    const userDetails = req.user.db;
    const banId = req.params.id;
    if (banId) {
      const result = await service.unbanBatch(userDetails._id, [banId]);
      return res.json(result);
    }
    const { type, ids } = req.body;
    if (type === "all") {
      const result = await service.unbanAll(userDetails._id);
      return res.json(result);
    }
    const result = await service.unbanBatch(userDetails._id, ids);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { getBanned, banNumber, unban };
