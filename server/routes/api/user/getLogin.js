const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const User = require("../../../models/Users");
const Logins = require("../../../models/Login")

router.get("/", authValid, authValidWithDb, async (req, res) => {
    const userDetails = req.user.db;
    try {
        const user = await User.findOne({ _id: userDetails._id }).select("loginToken");
        const { loginToken } = user;
        const loginDetails = await Promise.all(loginToken.map(async (login) => {
            try {
                const data = await Logins.findOne({ token: login });
                return data;
            } catch (error) {
                console.log(error);
                return null;
            }
        }));
        const logins = loginDetails.filter(login => login !== null);
        const { password, tgId, ...data } = user.toObject({ getters: true });
        res.json({
            status: true,
            logins,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});
router.get("/ip", (req, res) => {
    var clientIp = requestIp.getClientIp(req)
    res.send(clientIp)
})
module.exports = router;
