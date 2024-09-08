const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/signup", authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/setup-profile", authController.setupProfile);
router.post("/logout", authController.logout);

router.get("/request-password-reset", authController.requestPasswordReset);
router.get("/verify-password-otp", authController.verifyResetPasswordOtp);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
