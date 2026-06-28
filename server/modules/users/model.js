const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, unique: true, required: true },
  userId: { type: String, unique: true, required: true },
  PostbackToken: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  loginToken: { type: Array, default: [] },
  phone: { type: Number },
  profileImg: { type: String },
  tgId: { type: Object, default: { chatId: "", contact: "", username: "", label: "" } },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  premium: { type: Boolean },
  plan: { type: String },
  userType: { type: String },
  globalPostBack: { type: Boolean },
  userStatus: { type: Boolean },
  premiumExpireDate: { type: Date },
});

UserSchema.index({ loginToken: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", UserSchema);
