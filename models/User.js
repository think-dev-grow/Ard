const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  kodeHex: { type: String, default: "" },
  email: { type: String, default: "" },
  firstname: { type: String, default: "" },
  lastname: { type: String, default: "" },
  contact: { type: String, default: "" },
  password: { type: String, default: "" },
  dhid: { type: String, default: "" },
  uid: { type: String, default: "" },
  securityQuestion: { type: Object, default: { question: "", answer: "" } },
});

module.exports = mongoose.model("User", UserSchema);
