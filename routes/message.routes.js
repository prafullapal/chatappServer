const express = require("express");
const messageController = require("../controllers/message.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/get-messages", authenticateUser, messageController.getMessages); 

module.exports = router;
