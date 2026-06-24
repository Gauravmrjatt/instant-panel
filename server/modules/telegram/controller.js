const service = require("./service");

async function getAlert(req, res) {
  try {
    const result = await service.getTelegramAlert(req.user.db.userId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function updateAlert(req, res) {
  try {
    const result = await service.updateTelegramAlert(req.user.db.userId, req.body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { getAlert, updateAlert };
