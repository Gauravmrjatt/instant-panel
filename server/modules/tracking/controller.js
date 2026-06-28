const service = require("./service");
const logger = require("../../lib/logger");

async function track(req, res) {
  try {
    const camp = req.params.campId || req.params.camp;
    const { aff_click_id, sub_aff_id, userIp, device } = req.query;

    if (!aff_click_id || !sub_aff_id) {
      return res.status(400).json({ status: false, msg: "aff_click_id and sub_aff_id are required" });
    }

    const campInfo = await service.getCampaign(camp);
    if (!campInfo) return res.status(404).json({ status: false, msg: "Campaign not found" });

    const click = await service.processClick(campInfo, aff_click_id, sub_aff_id, userIp, device, req);

    const trackingUrl = (campInfo.tracking || "").replace(/{click_id}/g, click);
    res.status(202).json({ status: true, url: trackingUrl, msg: "Redirect to the given URL.." });
  } catch (error) {
    logger.error({ err: error }, "Error in tracking");
    res.status(500).json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { track };