const { default: mongoose } = require("mongoose");
const { successResponse } = require("../helpers/responseHandler");
const Channel = require("../models/channel.model");
const User = require("../models/user.model");

const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.user.userId;
    const admin = await User.findById(userId);
    if (!admin) {
      return next({
        status: 404,
        message: "Admin not found",
      });
    }

    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length) {
      return next({
        status: 400,
        message: "Some members are not valid users",
      });
    }

    const newChannel = new Channel({ name, members, admin: userId });
    await newChannel.save();
    return successResponse(res, newChannel, "Channel created successfully");
  } catch (err) {
    return next(err);
  }
};

const getUserChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return successResponse(res, channels, "Channel fetched successfully");
  } catch (err) {
    return next(err);
  }
};

const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });
    if (!channel) {
      return next({
        status: 404,
        message: "Channel not found",
      });
    }

    const messages = channel.messages;

    return successResponse(
      res,
      messages,
      "Channel messages retrieved successfully"
    );
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createChannel,
  getUserChannels,
  getChannelMessages,
};
