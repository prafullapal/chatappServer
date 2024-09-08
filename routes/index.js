const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");

router.get("/", (req, res) => {
	res.status(200).json({ message: "Active" });
});

router.use("/api/auth", authRoutes);

module.exports = router;
