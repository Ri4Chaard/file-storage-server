const express = require("express");
const { uploadFile } = require("../controllers/fileController");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/upload", auth, isAdmin, uploadFile);

module.exports = router;
