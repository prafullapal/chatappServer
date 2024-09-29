const express = require("express");
const contactController = require("../controllers/contact.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/search", authenticateUser, contactController.searchContacts);
router.get("/get-contacts-for-dm", authenticateUser, contactController.getContactsForDMList);
router.get("/get-all-contacts", authenticateUser, contactController.getAllContacts);

module.exports = router;
