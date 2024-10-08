const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const { createFolder, getFolder } = require("../controllers/folderController");
const router = express.Router();

router.post("/create", auth, isAdmin, createFolder);

module.exports = router;
