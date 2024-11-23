const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getFolderWithChildren(folderId) {
    const folder = await prisma.folder.findUnique({
        where: { id: folderId || null },
        include: { children: true },
    });

    if (!folder) return [];

    folder.children = await Promise.all(
        folder.children.map((child) => getFolderWithChildren(child.id))
    );

    return folder;
}

exports.getUserDisk = async (req, res) => {
    const { userId, parentId } = req.query;
    const reqUserId = req.userId;

    if (reqUserId !== parseInt(userId) && reqUserId !== 1) {
        return res.status(403).json({ error: "Access denied" });
    }

    try {
        const files = await prisma.file.findMany({
            where: {
                userId: parseInt(userId),
                folderId: parentId ? parseInt(parentId) : null,
            },
        });

        let folders = await prisma.folder.findMany({
            where: {
                userId: parseInt(userId),
                parentId: null,
            },
            include: { children: true },
        });

        folders = await Promise.all(
            folders.map((folder) => getFolderWithChildren(folder.id))
        );

        const user = await prisma.user.findFirst({
            where: {
                id: parseInt(userId),
            },
        });
        const orderId = user.orderId;

        return res.status(200).json({ files, folders, orderId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to retrieve disk" });
    }
};
