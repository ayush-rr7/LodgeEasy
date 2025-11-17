const mongoose = require("mongoose");

const tempUserSchema = mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model("TempUser", tempUserSchema);
