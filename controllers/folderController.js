const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

exports.createFolder = async (req, res) => {
    const { name, userId, parentId } = req.body;

    try {
        const folder = await prisma.folder.create({
            data: {
                name,
                userId,
                parentId: parentId || null,
            },
        });

        res.status(201).json(folder);
    } catch (error) {
        res.status(400).json({ error: "Unable to create folder" });
    }
};

const deleteFolderRecursive = async (folderId) => {
    const files = await prisma.file.findMany({
        where: { folderId },
    });

    await prisma.file.deleteMany({
        where: { folderId },
    });

    for (const file of files) {
        const duplicateFiles = await prisma.file.findMany({
            where: { name: file.name },
        });

        if (duplicateFiles.length === 0) {
            const filePath = path.join(__dirname, "../uploads", file.name);
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath);
            }
        }
    }

    const subfolders = await prisma.folder.findMany({
        where: { parentId: folderId },
    });

    for (const subfolder of subfolders) {
        await deleteFolderRecursive(subfolder.id);
    }

    await prisma.folder.delete({
        where: { id: folderId },
    });
};

exports.deleteFolder = async (req, res) => {
    const { folderId } = req.params;

    try {
        await deleteFolderRecursive(parseInt(folderId));
        res.status(200).json({
            message: "Folder and all contents deleted successfully",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to delete folder" });
    }
};
