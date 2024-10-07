const { PrismaClient } = require("@prisma/client");

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

exports.getUserFolders = async (req, res) => {
    const { userId, parentId } = req.query;

    try {
        const folders = await prisma.folder.findMany({
            where: {
                userId: parseInt(userId),
                parentId: parseInt(parentId),
            },
            include: { children: true, files: true },
        });

        res.status(200).json(folders);
    } catch (e) {
        res.status(400).json({ error: "Unable to found folders" });
    }
};
