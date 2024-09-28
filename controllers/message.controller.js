const { successResponse } = require("../helpers/responseHandler");
const Message = require("../models/message.model");
const { mkdirSync, renameSync } = require("fs");

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

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next({
        status: 400,
        message: "Please upload a file",
      });
    }

    const date = Date.now();
    let fileDir = `uploads/files/${date}`;
    let fileName = `${fileDir}/${req.file.originalname}`;

    mkdirSync(fileDir, { recursive: true });

    renameSync(req.file.path, fileName);

    return successResponse(res, {filePath: fileName}, "File uploaded successfully");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMessages,
  uploadFile
};
