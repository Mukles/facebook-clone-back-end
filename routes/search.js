const {
  serachByName,
  addHistory,
  getHistory,
  deleteHistory,
} = require("../controllers/searchController");
const router = require("express").Router();

//GET USER BY SEARCH
router.get("/:search", serachByName);

//GET SAVED SEARCH
router.get("/history/:userId", getHistory);

// ADD HISTORY
router.post("/:userId", addHistory);

//DELETE HISTORY
router.delete("/:userId", deleteHistory);

module.exports = router;
