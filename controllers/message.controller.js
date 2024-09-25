const { successResponse } = require("../helpers/responseHandler");
const Message = require("../models/message.model");

const getMessages = async (req, res, next) => {
  try {
    const user1 = req.user.userId;
    const user2 = req.body.userId;

    if (!user1 || !user2) {
      return next({
        status: 400,
        message: "Please provide both user IDs",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ createdAt: 1 });

    return successResponse(res, messages, "Contacts fetched successfully");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMessages,
};
