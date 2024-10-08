const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");
const contactRoutes = require("./contact.routes");
const messageRoutes = require("./message.routes");
const channelRoutes = require("./channel.routes");


router.get("/", (req, res) => {
	res.status(200).json({ message: "Active" });
});

router.use("/api/auth", authRoutes);
router.use("/api/contacts", contactRoutes);
router.use("/api/messages", messageRoutes);
router.use("/api/channels", channelRoutes);

module.exports = router;
