const service = require("./service");
const myDetails = require("../../myDetails.json");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => { cb(null, uuidv4() + path.extname(file.originalname)); },
});
const upload = multer({ storage });

async function getProfile(req, res) {
  try {
    const result = await service.getUserProfile(req.user.db.userId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function getSessions(req, res) {
  try {
    const result = await service.getUserSessions(req.user.db._id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

async function uploadPhoto(req, res) {
  try {
    upload.single("profileImg")(req, res, async (err) => {
      if (err) return res.json({ status: false, msg: "Upload failed", error: err.message });
      if (!req.file) return res.json({ status: false, msg: "No file uploaded" });
      const result = await service.uploadProfileImage(req.user.db.userId, req.file.filename);
      res.json(result);
    });
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Something went wrong", error });
  }
}

module.exports = { getProfile, getSessions, uploadPhoto };
