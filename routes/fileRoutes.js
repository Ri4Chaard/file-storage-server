const express = require("express");
const {
    uploadFiles,
    getFile,
    viewFile,
} = require("../controllers/fileController");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/upload", auth, isAdmin, uploadFiles);
router.get("/:filename", auth, getFile);
router.get("/view/:filename", auth, viewFile);

module.exports = router;
