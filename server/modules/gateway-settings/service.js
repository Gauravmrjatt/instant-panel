const GatewaySettings = require("./model");
const redisClient = require("../../lib/redisClient");

async function getGatewaySettings(userId, user) {
  const gateway = await GatewaySettings.findOne({ userId });
  if (!gateway) {
    const gatewayData = await new GatewaySettings({ userId, user }).save();
    return { status: true, msg: "Gateway Settings Found Successfully!", type: gatewayData.type, guid: gatewayData.guid, url: gatewayData.url };
  }
  return { status: true, msg: "Gateway Settings Found Successfully!", type: gateway.type, guid: gateway.guid, url: gateway.url };
}

async function updateGatewaySettings(userId, data) {
  const { type, guid, url } = data;
  const gateway = await GatewaySettings.findOneAndUpdate({ userId }, { type, guid, url });
  await redisClient.del(`gatewaySetting:${userId}`);
  if (!gateway) {
    const gatewayData = await new GatewaySettings({ userId, user: userId }).save();
    return { status: true, msg: "Gateway Settings Found Successfully!", type: gatewayData.type, guid: gatewayData.guid, url: gatewayData.url };
  }
  return { status: true, msg: "Gateway Settings Updated Successfully!", type: gateway.type, guid: gateway.guid, url: gateway.url };
}

module.exports = { getGatewaySettings, updateGatewaySettings };
