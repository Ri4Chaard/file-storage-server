const express = require("express");
const { login, register, addUser } = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const {
    sendCode,
    verifyUser,
} = require("../controllers/verificationController");
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/add-user", auth, isAdmin, addUser);
router.post("/send-code", sendCode);
router.post("/verify-user", verifyUser);

module.exports = router;
