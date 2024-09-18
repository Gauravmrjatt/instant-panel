const mongoose = require("mongoose");
const myDetails = require("../../pages/myDetails.json");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: myDetails.name,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  PostbackToken: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  loginToken: {
    type: Array,
  },
  phone: {
    type: Number,
    required: true,
    minlength: 10,
    maxlength: 10,
  },
  profileImg: {
    type: String,
    default: "/assets/img/avatars/1.jpg",
  },
  tgId: {
    chatId: {
      type: Number,
      default: null,
    },
    contact: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
  premium: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: "String",
    default: null,
  },
  userType: {
    type: String,
    default: "affilate",
  },
  userStatus: {
    type: String,
    default: "active",
  },
  premiumExpireDate: {
    type: Date,
    default: () => Date.now(),
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
