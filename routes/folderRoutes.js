const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const {
    createFolder,
    getFolder,
    deleteFolder,
} = require("../controllers/folderController");
const router = express.Router();

router.post("/create", auth, isAdmin, createFolder);
router.delete("/delete/:folderId", auth, isAdmin, deleteFolder);

module.exports = router;
