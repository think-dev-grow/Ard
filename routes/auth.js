const express = require("express");

const { sendOTP, verifyOTP, completeProfile } = require("../controllers/auth");
const verifyToken = require("../utils/verifyToken");

const router = express.Router();

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyToken, verifyOTP);

router.post("/complete-profile/:id", completeProfile);

module.exports = router;
