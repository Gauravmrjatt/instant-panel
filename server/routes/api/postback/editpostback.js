const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const User = require("../../../models/Users");
router.post("/", authValid, authValidWithDb, async (req, res) => {

    const updatedUser = await User.findOneAndUpdate(
        { loginToken: req.user.loginToken },
        [
            {
                $set: {
                    globalPostBack: { $not: "$globalPostBack" }
                }
            }
        ],
        { new: true }
    ); if (!updatedUser) {
        return res.json({
            status: false,
            msg: "Error in updating postback key"
        })
    } else {
        return res.json({
            status: true,

            isEnabled: updatedUser.globalPostBack,
        })
    }
});

module.exports = router;
