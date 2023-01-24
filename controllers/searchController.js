const mongoose = require("mongoose");
const User = require("../models/User");

const serachByName = async (req, res) => {
  try {
    const { search } = req.params;
    const user = await User.find({
      userName: { $regex: search, $options: "i" },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await User.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(userId) },
      },
      {
        $addFields: {
          searchHistorys: {
            $filter: {
              input: "$searchHistory",
              as: "searchItem",
              cond: { $eq: [mongoose.isValidObjectId("$$searchItem"), true] },
            },
          },
        },
      },
    ]);

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { search } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { searchHistory: search } }
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { search } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { searchHistory: search } }
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { serachByName, getHistory, addHistory, deleteHistory };
