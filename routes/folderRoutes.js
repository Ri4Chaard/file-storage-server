const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const {
    createFolder,
    getAllFolders,
} = require("../controllers/folderController");
const router = express.Router();

router.post("/create", auth, isAdmin, createFolder);
router.get("/getAll", auth, getAllFolders);

module.exports = router;
