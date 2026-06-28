const service = require("./service");
const logger = require("../../lib/logger");

async function getClick(req, res) {
  try {
    const result = await service.getClick(req.user.db._id, req.params.id, req.query.event);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Somthing went wrong", error });
  }
}

async function exportClicks(req, res) {
  try {
    const result = await service.exportClicks(req.user.db._id, req.params.id);
    if (!result.status) return res.status(404).json(result);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.send(result.csv);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ status: false, msg: "Failed to export clicks" });
  }
}

async function search(req, res) {
  try {
    const result = await service.searchClicks(req.user.db._id, req.body.data);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { getClick, exportClicks, search };
