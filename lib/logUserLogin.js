const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.logUserLogin = async (userId) => {
    await prisma.loginLog.create({
        data: {
            userId,
        },
    });
};
