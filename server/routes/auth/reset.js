const express = require("express")
const router = express.Router()
const myDetails = require('../../../pages/myDetails.json');
const ResetPassword = require('../../models/ResetPassword');
const { v4: uuidv4 } = require('uuid')

router.get("/check/:token", async (req, res) => {
    const checkToken = await ResetPassword.findOne({
        token: req.params.token
    }).populate('userId');
    if (!checkToken) {
        return res.json({ status: false, msg: "Invalid link" })
    }
    if (checkToken.isUsed === true) {
        return res.json({ status: false, msg: "Link has already used" })
    }
    if (checkToken.expires < Date.now()) {
        return res.json({ status: false, msg: "Link has expired." })
    }
    res.json({ status: true, msg: "valid link" })
})
router.post("/:token", async (req, res) => {
    const { password } = req.body;
    const checkToken = await ResetPassword.findOne({
        token: req.params.token
    }).populate('userId');
    if (!checkToken) {
        return res.json({ status: false, msg: "Invalid link" })
    }
    if (checkToken.isUsed === true) {
        return res.json({ status: false, msg: "Link has already used" })
    }
    if (checkToken.expires < Date.now()) {
        return res.json({ status: false, msg: "Link has expired." })
    }
    if (!password) {
        return res.json({ status: false, msg: "Password is required" })
    }
    checkToken.isUsed = true;
    checkToken.userId.password = password;
    checkToken.userId.loginToken = [uuidv4()]

    await checkToken.userId.save()
    await checkToken.save()
    console.log(checkToken);
    return res.json({ status: true, msg: "Password reset successfully" })
})
module.exports = router;