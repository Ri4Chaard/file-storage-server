const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const { getUsers } = require("../controllers/userController");
const router = express.Router();

router.get("/getAll", auth, isAdmin, getUsers);

module.exports = router;
