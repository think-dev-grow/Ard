const express = require("express");

const {
  sendOTP,
  verifyOTP,
  completeProfile,
  wrongEmail,
  securityQusetion,
  login,
  forgotPassword,
  verifyToken,
  resetPassword,
} = require("../controllers/auth");

const router = express.Router();

router.post("/send-otp", sendOTP);

router.post("/verify-otp/:token", verifyOTP);

router.post("/complete-profile/:id", completeProfile);

router.delete("/wrong-email/:id", wrongEmail);

router.put("/security-question/:id", securityQusetion);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.get("/verify/reset-password/:token", verifyToken);

router.put("/reset-password/:id", resetPassword);

module.exports = router;
