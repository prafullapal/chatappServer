const { successResponse } = require("../helpers/responseHandler");
const User = require("../models/user.model");

const searchContacts = async (req, res, next) => {
  try {
    const searchTerm = req.body.searchTerm;
    if (!searchTerm)
      return next({
        status: 400,
        message: "Please provide a search term",
      });

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");
    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.user.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    });

    return successResponse(res, contacts, "Contacts fetched successfully");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
    searchContacts,
}