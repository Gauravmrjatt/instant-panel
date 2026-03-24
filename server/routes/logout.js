const express = require("express");
const router = express.Router();
const Logins = require("../models/Users");
router.all("/", (req, res) => {
  res
    .clearCookie("jwt_token", { sameSite: "none", secure: true, path: "/" })
    .redirect("/auth/login");
});
router.all("/:id", (req, res) => {
  const loginToken = req.params.id;
  Logins.updateOne({ loginToken }, { $pull: { loginToken: loginToken } }).then(
    () => {
      if (req.query.devices) {
        return res
          .clearCookie("jwt_token", {
            sameSite: "none",
            secure: true,
            path: "/",
          })
          .json({ status: true });
      }
      res
        .clearCookie("jwt_token", { sameSite: "none", secure: true, path: "/" })
        .redirect("/auth/login");
    },
  );
});

module.exports = router;
