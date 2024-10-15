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

    try {
        const files = await prisma.file.findMany({
            where: {
                userId: parseInt(userId),
                folderId: parentId ? parseInt(parentId) : null,
            },
        });

        let folders = [];

        folders = await prisma.folder.findMany({
            where: {
                userId: parseInt(userId),
                parentId: null,
            },
            include: { children: true },
        });

        folders = await Promise.all(
            folders.map((folder) => getFolderWithChildren(folder.id))
        ).then((results) => results.flat());

        res.status(200).json({ files, folders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve disk" });
    }
};
