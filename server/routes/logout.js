const express = require("express")
const router = express.Router()
const Logins = require("../models/Users")
router.all("/", (req, res) => {
    res.clearCookie("jwt_token").redirect("/auth/login");
})
router.all("/:id", (req, res) => {
    const loginToken = req.params.id
    Logins.updateOne(
        { loginToken },
        { $pull: { loginToken: loginToken } }
    ).then(() => {
        if (req.query.devices) {
            return res.json({ status: true })
        }
        res.redirect("/auth/login")
    })
})

module.exports = router