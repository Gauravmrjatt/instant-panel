const service = require("./service");
const { clearCampaignCache } = require("../tracking/service");
const logger = require("../../lib/logger");

async function create(req, res) {
  try {
    const userDetails = req.user.db;
    const result = await service.createCampaign(userDetails._id, userDetails.userId, req.body);
    res.json(result);
  } catch (error) {
    if (error.message.includes("uniqueOfferID_1 dup key")) {
      res.json({ status: false, msg: "duplicate offerid" });
    } else {
      res.json({ status: false, msg: "somthing went wrong", error: error.message });
    }
  }
}

async function list(req, res) {
  try {
    const result = await service.getCampaigns(req.user.db._id);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function getById(req, res) {
  try {
    const result = await service.getCampaignById(req.user.db._id, req.params.id);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.json({ status: false, msg: "Something went wrong" });
  }
}

async function update(req, res) {
  try {
    const userDetails = req.user.db;
    const campaignId = req.params.id || req.body._id;
    const data = req.body.data || req.body;
    const result = await service.updateCampaign(userDetails._id, campaignId, data);
    if (!result.status) return res.status(400).json(result);
    clearCampaignCache(campaignId);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function remove(req, res) {
  try {
    const userDetails = req.user.db;
    const campaignId = req.params.id || req.body._id;
    const result = await service.deleteCampaign(userDetails._id, campaignId);
    if (!result.status) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    logger.error({ err: error });
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}

async function search(req, res) {
  try {
    const result = await service.searchCampaigns(req.user.db._id, req.query.text);
    res.json(result);
  } catch (error) {
    res.json({ status: false, msg: "Something went wrong" });
  }
}

module.exports = { create, list, getById, update, remove, search };
