const express = require("express");
const messageController = require("../controllers/message.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");
const multer = require("multer");
const router = express.Router();

const upload = multer({ dest: "uploads/files" });

router.post("/get-messages", authenticateUser, messageController.getMessages);
router.post(
  "/upload-file",
  authenticateUser,
  upload.single("file"),
  messageController.uploadFile
);

module.exports = router;
