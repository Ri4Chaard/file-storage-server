const express = require("express");
const { login, register } = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/login", login);
router.post("/add-user", auth, isAdmin, register);

module.exports = router;
