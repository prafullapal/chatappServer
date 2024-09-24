const express = require("express");
const contactController = require("../controllers/contact.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/search", authenticateUser, contactController.searchContacts);

module.exports = router;
