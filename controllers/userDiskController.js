const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getUserDisk = async (req, res) => {
    const { userId, parentId } = req.query;

    try {
        const files = await prisma.file.findMany({
            where: {
                userId: parseInt(userId),
                folderId: parentId ? parseInt(parentId) : null,
            },
        });
        const folders = await prisma.folder.findMany({
            where: {
                userId: parseInt(userId),
                parentId: parseInt(parentId),
            },
            include: { children: true },
        });

        res.status(200).json({ files, folders });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve disk" });
    }
};
