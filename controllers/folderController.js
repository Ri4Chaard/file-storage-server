const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.createFolder = async (req, res) => {
    const { name, userId } = req.body;

    try {
        const folder = await prisma.folder.create({
            data: {
                name,
                userId,
            },
        });

        res.status(201).json(folder);
    } catch (e) {
        res.status(400).json({ error: "Unable to create folder" });
    }
};

exports.getAllFolders = async (req, res) => {
    const userId = parseInt(req.query.userId);

    try {
        const folders = await prisma.folder.findMany({
            where: {
                userId: userId,
            },
        });

        res.status(200).json(folders);
    } catch (e) {
        res.status(400).json({ error: "Unable to found folders" });
    }
};
