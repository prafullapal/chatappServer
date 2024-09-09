const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/signup", authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/setup-profile", authenticateUser, authController.setupProfile);
router.get("/user-info", authenticateUser, authController.userInfo);
router.post("/logout", authenticateUser, authController.logout);

router.get("/request-password-reset", authController.requestPasswordReset);
router.get("/verify-password-otp", authController.verifyResetPasswordOtp);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
