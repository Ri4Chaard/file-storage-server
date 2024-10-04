const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

exports.uploadFile = [
    upload.single("file"),
    async (req, res) => {
        try {
            const file = await prisma.file.create({
                data: {
                    name: req.file.filename,
                    path: req.file.path,
                    userId: req.userId,
                },
            });
            res.status(201).json(file);
        } catch (error) {
            res.status(500).json({ error: "File upload failed" });
        }
    },
];

exports.getFiles = async (req, res) => {
    try {
        const files = await prisma.file.findMany({
            where: { userId: req.userId },
        });
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve files" });
    }
};
