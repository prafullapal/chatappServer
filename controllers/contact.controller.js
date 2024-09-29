const mongoose = require("mongoose");
const { successResponse } = require("../helpers/responseHandler");
const User = require("../models/user.model");
const Message = require("../models/message.model");

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

const getContactsForDMList = async (req, res, next) => {
  try {
    let { userId } = req.user;
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: {
            $first: "$createdAt",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);
    return successResponse(res, contacts, "Contacts fetched successfully");
  } catch (error) {
    return next(error);
  }
};

const getAllContacts = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } }, "firstName lastName _id email");

    const contacts = users.map((user)=> ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id,
    }));

    return successResponse(res, contacts, "Contacts fetched successfully");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  searchContacts,
  getContactsForDMList,
  getAllContacts,
};
