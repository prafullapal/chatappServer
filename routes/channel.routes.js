const express = require("express");
const channelController = require("../controllers/channel.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/create-channel", authenticateUser, channelController.createChannel);
router.get("/get-user-channels", authenticateUser, channelController.getUserChannels);
router.get("/get-channel-messages/:channelId", authenticateUser, channelController.getChannelMessages);

module.exports = router;
