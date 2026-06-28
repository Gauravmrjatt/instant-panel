const service = require("./service");
const logger = require("../../lib/logger");

async function getSettings(req, res) {
  try {
    const userDetails = req.user.db;
    const result = await service.getGatewaySettings(userDetails._id, userDetails.userId);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function updateSettings(req, res) {
  try {
    const userDetails = req.user.db;
    const result = await service.updateGatewaySettings(userDetails._id, req.body);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { getSettings, updateSettings };
