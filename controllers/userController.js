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
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users" });
    }
};
