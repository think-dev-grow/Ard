const express = require("express");

const {
  sendOTP,
  verifyOTP,
  completeProfile,
  wrongEmail,
  securityQusetion,
  login,
  userVerification,
  getUser,
} = require("../controllers/auth");

const router = express.Router();

router.post("/send-otp", sendOTP);

router.post("/verify-otp/:token", verifyOTP);

router.post("/complete-profile/:id", completeProfile);

router.delete("/wrong-email/:id", wrongEmail);

router.put("/security-question/:id", securityQusetion);

router.post("/login", login);

router.get("/user", userVerification, getUser);

module.exports = router;
