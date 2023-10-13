const express = require("express");
const router = express.Router();
const { authValid, authValidWithDb } = require("../../../middlewares/auth");
const myDetails = require("../../../../pages/myDetails.json");
const User = require("../../../models/Users");
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
var jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../../../server/public/assets/avatars"));
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
    } else {
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/', authValid, authValidWithDb, upload.single('profileImg'), async (req, res, next) => {
    const userDetails = req.user.db;
    try {
        const url = req.protocol + '://' + req.get('host');
        if (!req.file) {
            return res.status(400).json({ status: false, msg: "select a image first" });
        }
        const user = await User.findOneAndUpdate(
            { _id: userDetails._id },
            { profileImg: '/static/assets/avatars' + req.file.filename });
        if (!user) {
            res.json({ status: false, msg: "error while updating", profileImg: '/static/assets/avatars/' + req.file.filename })
        }
        const expireTime = 30 * 24 * 60 * 60; const token = jwt.sign(
            {
                name: req.user.name,
                loginToken: req.user.loginToken,
                userId: req.user.userId,
                profileImg: '/static/assets/avatars/' + req.file.filename
            },
            myDetails.enc_secret,
            {
                expiresIn: expireTime,
            }
        );
        res.cookie("jwt_token", token, { expires: new Date(Date.now() + expireTime * 1000) });

        res.json({ status: true, msg: "saved", profileImg: '/static/assets/avatars/' + req.file.filename })
    } catch (error) {
        res.json({ status: false, msg: error.getMessage })
    }
});

module.exports = router;

