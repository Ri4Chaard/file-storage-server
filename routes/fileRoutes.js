const express = require("express");
const { uploadFile, getFiles } = require("../controllers/fileController");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/upload", auth, isAdmin, uploadFile);
router.post("/show", auth, getFiles);

module.exports = router;
