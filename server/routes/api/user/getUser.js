const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../../pages/myDetails.json");
const User = require("../../../models/Users");

router.get("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;
    try {
        const user = await User.findOne({ _id: userDetails._id });
        const { tgId, loginToken, password, ...data } = user.toObject({ getters: true });
        delete data.password;
        delete data.tgId;
        delete data.loginToken;
        res.json({
            status: true,
            ...data
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

module.exports = router;
