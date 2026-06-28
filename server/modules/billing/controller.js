const service = require("./service");
const logger = require("../../lib/logger");

async function getBilling(req, res) {
  try {
    const result = await service.getBilling(req.user.db);
    if (!result.status) return res.status(403).json(result);
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, "/get/billing");
    res.json({ status: true, msg: "internal server error", error: error.message });
  }
}

module.exports = { getBilling };
