const express = require("express");
const {
    uploadFiles,
    getFile,
    deleteFile,
    downloadSelected,
} = require("../controllers/fileController");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/upload", auth, isAdmin, uploadFiles);
router.get("/:filename", auth, getFile);
router.delete("/delete/:fileId", auth, isAdmin, deleteFile);
router.post("/download-selected", auth, downloadSelected);

module.exports = router;
