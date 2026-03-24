const express = require("express");
const router = express.Router();
const Logins = require("../models/Users");
router.all("/", (req, res) => {
  res
    .clearCookie("jwt_token", { sameSite: "none", secure: true, path: "/" })
    .json({ status: true, msg: "Logged out successfully" });
});
router.all("/:id", (req, res) => {
  const loginToken = req.params.id;
  Logins.updateOne({ loginToken }, { $pull: { loginToken: loginToken } }).then(
    () => {
      res
        .clearCookie("jwt_token", { sameSite: "none", secure: true, path: "/" })
        .json({ status: true });
    },
  );
});

module.exports = router;
