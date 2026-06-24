const service = require("./service");
const User = require("../users/model");
const Campaign = require("../campaigns/model");
const CustomAmount = require("./model");

async function create(req, res) {
  try {
    const userDetails = req.user.db;
    const result = await service.createCustomAmount(userDetails._id, userDetails.userId, req.body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function list(req, res) {
  try {
    const result = await service.getCustomAmounts(req.user.db._id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function remove(req, res) {
  try {
    const itemId = req.params.id || req.body._id;
    const { type, ids } = req.body;
    if (type === "all") {
      const result = await service.deleteAllCustomAmounts(req.user.db._id);
      return res.json(result);
    }
    if (ids) {
      const result = await service.deleteBatchCustomAmounts(ids);
      return res.json(result);
    }
    const result = await service.deleteCustomAmount(itemId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function upsertByApiKey(req, res) {
  try {
    const apikey = req.params.apiKey || req.params.apikey;
    const { camp, ...body } = req.body;
    if (!apikey) return res.status(400).json({ status: false, msg: "API key is missing" });
    const isUser = await User.findOne({ PostbackToken: apikey });
    if (!isUser) return res.status(401).json({ status: false, msg: "Invalid API token" });
    const isCamp = await Campaign.findOne({ offerID: camp, userId: isUser._id });
    if (!isCamp) return res.status(404).json({ status: false, msg: "Invalid campaign ID" });
    const updated = await CustomAmount.findOneAndUpdate(
      { campId: isCamp._id, event: body.event, number: body.number.trim().toLowerCase() },
      { userId: isUser._id, user: isUser.userId, ...body, campId: isCamp._id },
      { new: true, upsert: true }
    );
    res.json({ status: true, msg: updated.isNew ? "Custom details added successfully" : "Custom details updated successfully", id: updated._id });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ status: false, msg: "Internal server error", error: error.message });
  }
}

async function getByApiKey(req, res) {
  try {
    const apikey = req.params.apiKey || req.params.apikey;
    const { camp, ...body } = req.body;
    if (!apikey) return res.json({ status: false, msg: "Api key is missing" });
    const isUser = await User.findOne({ PostbackToken: apikey });
    if (!isUser) return res.json({ status: false, msg: "Invalid api token" });
    const isCamp = await Campaign.findOne({ offerID: camp, userId: isUser._id });
    if (!isCamp) return res.json({ status: false, msg: "Invalid campaign id" });
    const custom = await CustomAmount.findOne({ campId: isCamp._id, event: body.event, number: body.number.trim().toLowerCase() })
      .select("number name event userAmount referAmount userComment referComment createdAt -_id");
    if (custom) return res.json({ status: true, isCustom: true, msg: "Details found", data: custom });
    const eventDetails = isCamp.events.find((e) => e.name === body.event.toString());
    if (eventDetails) return res.json({ status: true, isCustom: false, msg: "Details found", data: { number: body.number.trim().toLowerCase(), name: isCamp.name, event: body.event, userAmount: eventDetails.user, referAmount: eventDetails.refer, userComment: eventDetails.userComment, referComment: eventDetails.referComment, createdAt: isCamp.createdAt } });
    return res.json({ status: false, msg: "Event not found in campaign" });
  } catch (error) {
    return res.json({ status: false, msg: "Internal server error", error: error.message });
  }
}

module.exports = { create, list, remove, upsertByApiKey, getByApiKey };
