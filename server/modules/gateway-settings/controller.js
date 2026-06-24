const service = require("./service");

async function getSettings(req, res) {
  try {
    const userDetails = req.user.db;
    const result = await service.getGatewaySettings(userDetails._id, userDetails.userId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function updateSettings(req, res) {
  try {
    const userDetails = req.user.db;
    const result = await service.updateGatewaySettings(userDetails._id, req.body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { getSettings, updateSettings };
