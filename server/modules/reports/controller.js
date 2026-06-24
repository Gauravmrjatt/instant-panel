const service = require("./service");

async function getReports(req, res) {
  try {
    const data = await service.getReportsData(req.user.db._id, req.query.range);
    res.json({ status: true, data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function getNewReport(req, res) {
  try {
    const data = await service.getNewReportData(req.user.db._id, req.params.id);
    if (!data) return res.status(404).json({ status: false, message: "Campaign not found" });
    res.json({ status: true, data });
  } catch (error) {
    console.log("report error >> ", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

module.exports = { getReports, getNewReport };