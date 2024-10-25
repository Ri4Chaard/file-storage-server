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

const deleteFolderRecursive = async (folderId, phone) => {
    const files = await prisma.file.findMany({
        where: { folderId },
    });

    await prisma.file.deleteMany({
        where: { folderId },
    });

    for (const file of files) {
        const filePath = path.join(__dirname, "../uploads/" + phone, file.name);
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath);
        }
    }

    const subfolders = await prisma.folder.findMany({
        where: { parentId: folderId },
    });

    for (const subfolder of subfolders) {
        await deleteFolderRecursive(subfolder.id, phone);
    }

    await prisma.folder.delete({
        where: { id: folderId },
    });
};

exports.deleteFolder = async (req, res) => {
    const { folderId } = req.params;

    try {
        const folder = await prisma.folder.findFirst({
            where: {
                id: parseInt(folderId),
            },
            include: {
                user: true,
            },
        });

        await deleteFolderRecursive(parseInt(folderId), folder.user.phone);
        res.status(200).json({
            message: "Folder and all contents deleted successfully",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to delete folder" });
    }
};
