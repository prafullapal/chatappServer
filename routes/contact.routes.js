const express = require("express");
const contactController = require("../controllers/contact.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/search", authenticateUser, contactController.searchContacts);
router.get("/get-contacts-for-dm", authenticateUser, contactController.getContactsForDMList);

module.exports = router;
