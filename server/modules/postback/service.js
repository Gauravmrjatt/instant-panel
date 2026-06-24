const User = require("../users/model");
const myDetails = require("../../myDetails.json");
const { v4: uuidv4 } = require("uuid");
const { sendToQueue } = require("../../lib/rabbitMQ");

async function getPostbackConfig(user, protocol, host) {
  const { PostbackToken, globalPostBack } = user;
  const domain = `${protocol}://${host}`;
  return { status: true, msg: "Postback key found!", key: PostbackToken, isEnabled: globalPostBack, url: `${domain}/api/v1/postback/${PostbackToken}/{eventname}?click={click_id}&p1={pass extra params}` };
}

async function toggleGlobalPostback(loginToken) {
  const updatedUser = await User.findOneAndUpdate(
    { loginToken },
    [{ $set: { globalPostBack: { $not: "$globalPostBack" } } }],
    { new: true }
  );
  if (!updatedUser) return { status: false, msg: "Error in updating postback key" };
  return { status: true, isEnabled: updatedUser.globalPostBack };
}

async function regeneratePostbackToken(userId) {
  const newID = uuidv4();
  const result = await User.findByIdAndUpdate(userId, { PostbackToken: newID });
  if (!result) return { status: false, msg: "Error while updating key" };
  const url = `${myDetails.domain}api/v1/postback/${newID}/{eventname}?p1={aff_click_id}&p2={sub_aff_id}&o={offerid}`;
  return { status: true, msg: "Postback Updated Successfully", key: newID, url };
}

async function rejectLead(data) {
  try {
    await sendToQueue("lead_write", JSON.stringify(data));
  } catch (err) {
    const Lead = require("../leads/model");
    const lead = new Lead(data);
    await lead.save();
  }
}

module.exports = { getPostbackConfig, toggleGlobalPostback, regeneratePostbackToken, rejectLead };
