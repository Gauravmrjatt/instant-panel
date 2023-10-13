const authValid = (req, res, next) => {
    if (!req || !req.cookies || !req.body || !req.query || !req.headers) {
        return res.json({
            status: false,
            msg: "You need Authentication to access this page"
        })
    }

    var details = require("../../pages/myDetails.json");
    var jwt = require("jsonwebtoken");
    const token = req.cookies.jwt_token ||
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.redirect('/logout');
    }
    try {
        const decoded = jwt.verify(token, details.enc_secret);
        req.user = decoded;
    } catch (err) {
        return res.redirect('/logout');
    }
    return next();
};

const authValidWithDb = async (req, res, next) => {
    const User = require("../models/Users")
    const UserDbData = await User.findOne({ loginToken: req.user.loginToken })
    if (!UserDbData) {
        return res.redirect("/logout")
    }
    req.user.db = UserDbData;
    return next();
};

module.exports = { authValid, authValidWithDb }
