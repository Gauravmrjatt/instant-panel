const service = require("./service");

async function list(req, res) {
  try {
    const result = await service.getLeads(req.user.db._id, req.params.campId, req.query.page, req.query.limit);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function exportLeads(req, res) {
  try {
    const result = await service.exportLeads(req.user.db._id, req.params.id || req.params.campId);
    if (!result.status) return res.status(404).json(result);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.send(result.csv);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "Failed to export leads" });
  }
}

async function updateStatus(req, res) {
  try {
    const userDetails = req.user.db;
    const leadId = req.params.id || req.body.ID;
    const { leadStatus, event } = req.body;
    const result = await service.updateLeadStatus(userDetails._id, leadId, leadStatus, event);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Somthing went wrong", error });
    console.log(error);
  }
}

async function approve(req, res) {
  try {
    const userDetails = req.user.db;
    const leadId = req.params.id || req.body.ID;
    const { leadStatus } = req.body;
    const result = await service.approveLead(userDetails._id, leadId, leadStatus, userDetails.tgId);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Somthing went wrong", error });
    console.log(error);
  }
}

async function remove(req, res) {
  try {
    const result = await service.deleteLeads(req.user.db._id, req.body.selection);
    if (!result.status) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { list, exportLeads, updateStatus, approve, remove };
