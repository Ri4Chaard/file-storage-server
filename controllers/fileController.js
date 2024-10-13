const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage }).array("files");

exports.uploadFiles = [
    upload,
    async (req, res) => {
        const { folderId, userId } = req.body;

        try {
            const files = await Promise.all(
                req.files.map((file) =>
                    prisma.file.create({
                        data: {
                            name: file.filename,
                            path: file.path,
                            userId: parseInt(userId),
                            folderId: parseInt(folderId) || null,
                        },
                    })
                )
            );

            res.status(201).json(files);
        } catch (error) {
            res.status(500).json({ error: "File upload failed" });
        }
    },
];

exports.getFile = (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", fileName);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("Ошибка при отправке файла:", err);
            return res.status(404).json({ message: "Файл не найден" });
        }
    });
};
