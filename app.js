const express = require("express");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const cors = require("cors");
const path = require("path");

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

//test
app.use(
    "/",
    router.get("/", async (req, res) => {
        return res.json({ message: "it's working!" });
    })
);

module.exports = app;
