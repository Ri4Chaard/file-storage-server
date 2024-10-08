const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { getUserDisk } = require("../controllers/userDiskController");
const router = express.Router();

router.get("/get", auth, getUserDisk);

module.exports = router;
