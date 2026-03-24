const express = require("express");
const router = express.Router();
const User = require("../../../models/Users");
const Click = require("../../../models/Click");
const Lead = require("../../../models/Leads");
const saveLead = require("../../../lib/saveLead");
const handelPayment = require("../../../lib/handelPostBackPayments");
const Ban = require("../../../models/Ban");
const Notification = require("../../../lib/handelNotification");
const CustomAmount = require("../../../models/CustomAmount");

const checkParams = (req, res, next) => {
  const { PostbackToken, event } = req.params;
  const { click } = req.query;

  if (!PostbackToken || !click) {
    return res.json({
      status: false,
      msg: "PostbackToken and click are required",
    });
  }

  next();
};

router.get("/:PostbackToken/:event", checkParams, async (req, res) => {
  try {
    const { PostbackToken, event } = req.params;
    const { click } = req.query;
    const ip = req.ip;

    // Find user and click by IDs
    const user = await User.findOne({
      PostbackToken,
    });

    if (!user) {
      return res.json({
        status: false,
        msg: "Invalid PostbackToken",
      });
    }
    if(!user.globalPostBack){
      return res.json({
        status: false,
        msg: "Global Postback not allowed",
      });
    }
    const clickId = await Click.findOne({
      click,
      userId: user._id,
    }).populate("campId");

    // Check if user and click exist

    if (!clickId) {
      return res.json({
        status: false,
        msg: "Invalid Click ID",
      });
    }
    const campStatus = clickId.campId.campStatus;
    if (campStatus === false) {
      return res.json({
        status: false,
        msg: "Campaing has Paused",
      });
    }
    const checkLead = await Lead.findOne({
      clickId: clickId._id,
      event,
    });

    // chenge to same event
    if (checkLead) {
      return res.json({
        status: false,
        msg: "Click id has already Registered",
      });
    }
    // Check if event exists for the campaign
    let indexOfEvent;
    let eventData = clickId.campId.events.find((eventData, index) => {
      if (eventData.name === event) {
        indexOfEvent = index;
        return true;
      }
      return false;
    });

    if (!eventData) {
      return res.json({
        status: false,
        msg: "Invalid Event",
      });
    }
    //check custom refer
    const isCustom = await CustomAmount.findOne({
      number: clickId.refer,
      event: eventData.name,
      campId: clickId.campId._id,
    });
    //if cutom amount
    if (isCustom) {
      if (isCustom.referAmount !== null) {
        eventData.refer = isCustom.referAmount;
      }
      if (isCustom.userAmount !== null) {
        eventData.user = isCustom.userAmount;
      }
      if (isCustom.referComment) {
        eventData.referComment = isCustom.referComment;
      }
      if (isCustom.userComment) {
        eventData.userComment = isCustom.userComment;
      }
      if (!isCustom.referInstant) {
        clickId.campId.referPending = true;
      }
    }
    const ClickcreatedAt = clickId.createdAt;
    const currentTime = new Date();
    const clicktoconv = (currentTime - ClickcreatedAt) / 1000;
    // Check if postback server ip (if required) if manual then don't check ip
    if (req.query.type && req.query.type == "manual") {
    } else {
      if (clickId.campId.ips.length > 0 && !clickId.campId.ips.includes(ip)) {
        // Save and rejected
        await saveLead({
          clicktoconv: clicktoconv,
          userAmount: eventData.user,
          referAmount: eventData.refer,
          click: click,
          uniqueClick: {
            campId: clickId.campId._id,
            event,
            clickId: clickId._id,
          },
          userId: user._id,
          campId: clickId.campId._id,
          clickId: clickId._id,
          user: clickId.user,
          refer: clickId.refer,
          ip: clickId.ip,
          event,
          status: "REJECTED",
          message: "IP is not allowed",
          params: req.query,
          paymentStatus: "REJECTED",
        });
        return res.json({
          status: false,
          msg: "This IP is not allowed.",
        });
      }
    }
    //click to convesion delay
    if (indexOfEvent == 0) {
      if (clickId.campId.delay) {
        if (clicktoconv <= parseInt(clickId.campId.delay)) {
          await saveLead({
            clicktoconv: clicktoconv,
            userAmount: eventData.user,
            referAmount: eventData.refer,
            click: click,
            uniqueClick: {
              campId: clickId.campId._id,
              event,
              clickId: clickId._id,
            },
            userId: user._id,
            campId: clickId.campId._id,
            clickId: clickId._id,
            user: clickId.user,
            refer: clickId.refer,
            ip: clickId.ip,
            event,
            status: "REJECTED",
            message: "Click to conversion time delay is invalid",
            params: req.query,
            paymentStatus: "REJECTED",
          });
          if (user.tgId.chatId) {
            let textMessage = `<b>🛑 New Fruad Lead 
⚠️ Name : ${clickId.campId.name}
♻️ OfferID : ${clickId.campId.offerID}
🌀 Event : ${eventData.name}

🔆 User Number :- ${clickId.user}
📣 Reason :- Click to conversion time delay is invalid

🔆 Refer Number :- ${clickId.user}
📣 Reason :- Click to conversion time delay is invalid

⭐️ Lead is Disputed and Any Payment is Not Debited ✔️
🧲 Powered By <a href='https://earningarea.in/redirectto?instant'>Earning Area</a>
</b>`;
            //notifacation na ja rahe check it and remove cl add a offline page
            Notification(user.tgId.chatId, textMessage);
          }
          return res.json({
            status: false,
            msg: "Fraud Lead found",
          });
        }
      }
    }
    //check in user or refer is ban
    const [isUserBan, isReferBan] = await Promise.all([
      Ban.findOne({ userId: user._id, number: clickId.user.trim().toLowerCase() }),
      Ban.findOne({ userId: user._id, number: clickId.refer.trim().toLowerCase() }),
    ]);
    if (isUserBan) {
      await saveLead({
        clicktoconv: clicktoconv,
        userAmount: eventData.user,
        referAmount: eventData.refer,
        click: click,
        uniqueClick: {
          campId: clickId.campId._id,
          event,
          clickId: clickId._id,
        },
        userId: user._id,
        campId: clickId.campId._id,
        clickId: clickId._id,
        user: clickId.user,
        refer: clickId.refer,
        ip: clickId.ip,
        event,
        status: "REJECTED",
        message: "User Number is Banned",
        params: req.query,
        paymentStatus: "REJECTED",
        referPaymentStatus: "REJECTED",
      });
      return res.json({
        status: false,
        msg: "User Number is Banned",
      });
    }
    if (isReferBan) {
      await saveLead({
        clicktoconv: clicktoconv,
        userAmount: eventData.user,
        referAmount: eventData.refer,
        click: click,
        uniqueClick: {
          campId: clickId.campId._id,
          event,
          clickId: clickId._id,
        },
        userId: user._id,
        campId: clickId.campId._id,
        clickId: clickId._id,
        user: clickId.user,
        refer: clickId.refer,
        ip: clickId.ip,
        event,
        status: "REJECTED",
        message: "Refer Number is Banned",
        params: req.query,
        paymentStatus: "REJECTED",
        referPaymentStatus: "REJECTED",
      });
      return res.json({
        status: false,
        msg: "Refer Number is Banned",
      });
    }
    // Check if user and refer numbers are different (if required)
    if (!clickId.campId.same && clickId.user.trim() === clickId.refer.trim()) {
      // Save and rejected
      await saveLead({
        clicktoconv: clicktoconv,
        userAmount: eventData.user,
        referAmount: eventData.refer,
        click: click,
        uniqueClick: {
          campId: clickId.campId._id,
          event,
          clickId: clickId._id,
        },
        userId: user._id,
        campId: clickId.campId._id,
        clickId: clickId._id,
        user: clickId.user,
        refer: clickId.refer,
        ip: clickId.ip,
        event,
        status: "REJECTED",
        message: "User and refer number are the same",
        params: req.query,
        paymentStatus: "REJECTED",
        referPaymentStatus: "REJECTED",
      });
      return res.json({
        status: false,
        msg: "User and refer number are the same",
      });
    }

    // Check if IP has already claimed the offer (if required)
    if (
      clickId.campId.ip &&
      (await Lead.findOne({
        campId: clickId.campId._id,
        ip: clickId.ip,
        event,
      }))
    ) {
      await saveLead({
        clicktoconv: clicktoconv,
        userAmount: eventData.user,
        referAmount: eventData.refer,
        click: click,
        uniqueClick: {
          campId: clickId.campId._id,
          event,
          clickId: clickId._id,
        },
        userId: user._id,
        campId: clickId.campId._id,
        clickId: clickId._id,
        user: clickId.user,
        refer: clickId.refer,
        ip: clickId.ip,
        event,
        status: "REJECTED",
        message: "Duplicate IP Address",
        params: req.query,
        paymentStatus: "REJECTED",
        referPaymentStatus: "REJECTED",
      });
      return res.json({
        status: false,
        msg: "One IP can claim only once",
      });
    }

    // Check if user has already claimed the offer (if required)
    // Check if the user contains '@' and perform the corresponding search
    const userValue = clickId.user;
    let userQuery;

    if (userValue.includes("@")) {
      // Extract prefix before '@' and construct the query for UPI ID
      const prefix = userValue.split("@")[0];
      userQuery = { $regex: `^${prefix}@` }; // Prefix-based search
    } else {
      // Normal search with exact user value
      userQuery = userValue;
    }

    if (
      clickId.campId.paytm &&
      (await Lead.findOne({
        campId: clickId.campId._id,
        user: userQuery, // Use the dynamically built query
        event,
      }))
    ) {
      await saveLead({
        clicktoconv: clicktoconv,
        userAmount: eventData.user,
        referAmount: eventData.refer,
        click: click,
        uniqueClick: {
          campId: clickId.campId._id,
          event,
          clickId: clickId._id,
        },
        userId: user._id,
        campId: clickId.campId._id,
        clickId: clickId._id,
        user: clickId.user,
        refer: clickId.refer,
        ip: clickId.ip,
        event,
        status: "Pending",
        message: "Duplicate User Number",
        params: req.query,
        paymentStatus: "PENDING",
        referPaymentStatus: "REJECTED",
      });

      return res.json({
        status: false,
        msg: "One user can claim only once",
      });
    }

    if (eventData.caps) {
      const leadCount = await Lead.countDocuments({
        campId: clickId.campId._id,
        event,
        status: "Approved",
      });

      // Save and pending

      if (parseInt(eventData.caps) <= parseInt(leadCount)) {
        await saveLead({
          clicktoconv: clicktoconv,
          userAmount: eventData.user,
          referAmount: eventData.refer,
          click: click,
          uniqueClick: {
            campId: clickId.campId._id,
            event,
            clickId: clickId._id,
          },
          userId: user._id,
          campId: clickId.campId._id,
          clickId: clickId._id,
          user: clickId.user,
          refer: clickId.refer,
          ip: clickId.ip,
          event,
          status: "Pending",
          message: "All the Leads have completed",
          params: req.query,
          paymentStatus: "PENDING",
          referPaymentStatus: "PENDING",
        });
        return res.json({
          status: true,
          msg: "This Lead caps has been reached",
        });
      }
    }
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    const [leadCount, totalLeadsCount] = await Promise.all([
      Lead.countDocuments({
        campId: clickId.campId._id,
        event,
        status: "Approved",
        createdAt: {
          $gte: currentDate,
          $lt: nextDate,
        },
      }),
      Lead.countDocuments({
        campId: clickId.campId._id,
        event,
        status: "Approved",
      }),
    ]);
    if (eventData.dailyCaps) {
      // Save and pending

      if (parseInt(eventData.dailyCaps) <= parseInt(leadCount)) {
        await saveLead({
          clicktoconv: clicktoconv,
          userAmount: eventData.user,
          referAmount: eventData.refer,
          click: click,
          uniqueClick: {
            campId: clickId.campId._id,
            event,
            clickId: clickId._id,
          },
          userId: user._id,
          campId: clickId.campId._id,
          clickId: clickId._id,
          user: clickId.user,
          refer: clickId.refer,
          ip: clickId.ip,
          event,
          status: "Pending",
          message: "All Daily Leads have completed",
          params: req.query,
          paymentStatus: "PENDING",
          referPaymentStatus: "PENDING",
        });
        return res.json({
          status: true,
          msg: "This Lead daily caps has been reached",
        });
      }
    }
    const isPrevEnable = clickId.campId.prevEvent ?? true;
    let checkTime = null;
    if (indexOfEvent > 0) {
      const time = clickId.campId.events[indexOfEvent - 1].time;
      const eventName = clickId.campId.events[indexOfEvent - 1].name;
      const IsprevEvent = await Lead.findOne({
        campId: clickId.campId._id,
        user: clickId.user,
        event: eventName,
        status: { $ne: "REJECTED" },
        click,
      });

      checkTime = IsprevEvent?.createdAt ?? null;
      //if last not found add to pending ?? rejected??
      if (isPrevEnable === true) {
        if (!IsprevEvent) {
          await saveLead({
            clicktoconv: clicktoconv,
            userAmount: eventData.user,
            referAmount: eventData.refer,
            click: click,
            uniqueClick: {
              campId: clickId.campId._id,
              event,
              clickId: clickId._id,
            },
            userId: user._id,
            campId: clickId.campId._id,
            clickId: clickId._id,
            user: clickId.user,
            refer: clickId.refer,
            ip: clickId.ip,
            event,
            status: "REJECTED",
            message: "Previous event not found",
            params: req.query,
            paymentStatus: "REJECTED",
            referPaymentStatus: "REJECTED",
          });
          return res.json({
            status: false,
            msg: "Previous event not found",
          });
        }

        if (time > 0 && time != "") {
          const createdAt = checkTime;
          const current = new Date();

          const timeDifference = (current - createdAt) / (1000 * 60);
          if (parseInt(timeDifference) <= parseInt(time)) {
            await saveLead({
              clicktoconv: clicktoconv,
              userAmount: eventData.user,
              referAmount: eventData.refer,
              click: click,
              uniqueClick: {
                campId: clickId.campId._id,
                event,
                clickId: clickId._id,
              },
              userId: user._id,
              campId: clickId.campId._id,
              clickId: clickId._id,
              user: clickId.user,
              refer: clickId.refer,
              ip: clickId.ip,
              event,
              status: "Pending",
              message:
                "Time difference is less than as you set between two events.",
              params: req.query,
              paymentStatus: "PENDING",
              referPaymentStatus: "PENDING",
            });
            return res.json({
              status: false,
              msg: "Time difference is less than as you set between two events.",
            });
          }
        }
      }
    }
    // Update the pending record with lead information
    if (eventData.payMode == "auto") {
      handelPayment(
        user._id,
        eventData,
        {
          userAmount: eventData.user,
          referAmount: eventData.refer,
          click,
          userId: user._id,
          campId: clickId.campId._id,
          clickId: clickId._id,
          user: clickId.user,
          refer: clickId.refer,
          ip: clickId.ip,
          event,
          params: req.query,
          uniqueClick: {
            campId: clickId.campId._id,
            event,
            clickId: clickId._id,
          },
          clicktoconv,
        },
        user.tgId,
        clickId.campId,
        leadCount,
        totalLeadsCount,
        clicktoconv
      );
    } else {
      await saveLead({
        clicktoconv: clicktoconv,
        userAmount: eventData.user,
        referAmount: eventData.refer,
        click: click,
        uniqueClick: {
          campId: clickId.campId._id,
          event,
          clickId: clickId._id,
        },
        userId: user._id,
        campId: clickId.campId._id,
        clickId: clickId._id,
        user: clickId.user,
        refer: clickId.refer,
        ip: clickId.ip,
        event,
        status: "Pending",
        message:
          "This Lead request has been successfully completed. Payment is manual",
        params: req.query,
        paymentStatus: "PENDING",
        payMessage: "You have set payment mode to manual",
        referPaymentStatus: "PENDING",
        referPayMessage: "You have set payment mode to manual",
      });
    }
    return res.json({
      status: true,
      msg: "This Lead request has been successfully completed. Please check payment status.",
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      msg: "Something went wrong",
      err: error,
    });
  }
});

module.exports = router;
