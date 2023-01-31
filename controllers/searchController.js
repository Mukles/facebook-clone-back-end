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

    const searchHistorys = await User.findOne(
      { _id: userId },
      { searchHistory: 1 }
    );
    const histories = searchHistorys.searchHistory.slice(0, 12);
    const searchHistorysWithDetails = await Promise.all(
      histories.map(async (item) => {
        if (
          mongoose.isObjectIdOrHexString(item) &&
          mongoose.isValidObjectId(item)
        ) {
          const user = await User.findOne({
            _id: mongoose.Types.ObjectId(item),
          });
          return user;
        } else {
          return item;
        }
      })
    );

    res.status(200).json(searchHistorysWithDetails);
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
      { $push: { searchHistory: { $each: [search], $position: 0 } } }
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
