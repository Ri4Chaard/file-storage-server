const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const { getUsers, addComment } = require("../controllers/userController");
const router = express.Router();

router.get("/getAll", auth, isAdmin, getUsers);
router.patch("/add-comment", auth, isAdmin, addComment);

module.exports = router;
