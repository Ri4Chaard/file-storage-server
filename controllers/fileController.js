const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { userId } = req.body;

        prisma.user
            .findUnique({ where: { id: parseInt(userId) } })
            .then((user) => {
                if (user) {
                    const userFolderPath = path.join(
                        __dirname,
                        "../uploads",
                        user.phone
                    );
                    if (!fs.existsSync(userFolderPath)) {
                        fs.mkdirSync(userFolderPath, { recursive: true });
                    }
                    cb(null, userFolderPath);
                } else {
                    cb(new Error("User not found"), null);
                }
            })
            .catch((error) => {
                cb(error, null);
            });
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${file.originalname}`;
        cb(null, uniqueFilename);
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
                            size: file.size,
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

exports.getFile = async (req, res) => {
    const userId = req.userId;

    try {
        const { filename } = req.params;
        const file = await prisma.file.findFirst({
            where: { name: filename },
            include: { owner: true },
        });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (userId !== file.owner.id && userId !== 1) {
            return res.status(403).json({ error: "Access denied" });
        }

        const filePath = path.join(
            __dirname,
            "../uploads/" + file.owner.phone,
            filename
        );

        if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                if (start >= fileSize) {
                    res.status(416).send(
                        `Requested range not satisfiable\n${start} >= ${fileSize}`
                    );
                    return;
                }

                const chunksize = end - start + 1;
                const fileStream = fs.createReadStream(filePath, {
                    start,
                    end,
                });

                res.writeHead(206, {
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize,
                    "Content-Type": "application/octet-stream",
                });

                fileStream.pipe(res);
            } else {
                res.writeHead(200, {
                    "Content-Length": fileSize,
                    "Content-Type": "application/octet-stream",
                });

                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);
            }
        } else {
            return res.status(404).json({ message: "File not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await prisma.file.findFirst({
            where: { id: parseInt(fileId) },
            include: { owner: true },
        });

        const deletedFile = await prisma.file.delete({
            where: { id: parseInt(fileId) },
        });

        const filePath = path.join(
            __dirname,
            "../uploads/" + file.owner.phone,
            deletedFile.name
        );
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
        }

        res.status(200).json({ message: "File deleted" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "File delete failed" });
    }
};

exports.downloadSelected = async (req, res) => {
    try {
        const { selectedFiles } = req.body;

        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        archive.on("error", (err) => {
            res.status(500).send({ error: err.message });
        });

        const file = await prisma.file.findFirst({
            where: {
                id: selectedFiles[0],
            },
            include: {
                folder: true,
            },
        });
        const archiveName = file.folder ? file.folder.name : "main-page";

        res.attachment(`${archiveName}-${selectedFiles.length}.zip`);

        archive.pipe(res);

        for (const id of selectedFiles) {
            const file = await prisma.file.findFirst({
                where: { id },
                include: { owner: true },
            });
            const filePath = path.join(
                __dirname,
                "../uploads/" + file.owner.phone,
                file.name
            );
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: file.name.substring(14) });
            }
        }

        await archive.finalize();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Files download failed" });
    }
};
