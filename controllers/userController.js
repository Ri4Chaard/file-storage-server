const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getUsers = async (req, res) => {
    const { id } = req.query;

    try {
        const users = await prisma.user.findMany({
            where: {
                id: parseInt(id) || undefined,
                role: "USER",
            },
            include: {
                files: true,
                folders: true,
                loginLogs: true,
            },
            orderBy: {
                id: "asc",
            },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users" });
    }
};

exports.addComment = async (req, res) => {
    const { userId, comment } = req.body;

    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                comment,
            },
        });
        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: "Failed to add comment" });
    }
};
