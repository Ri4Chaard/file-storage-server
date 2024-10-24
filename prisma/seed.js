const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function up() {
    const hashedPassword = await bcrypt.hash("qwerty", 10);
    await prisma.user.createMany({
        data: [
            {
                phone: "8888888888",
                password: hashedPassword,
                role: "ADMIN",
            },
            {
                phone: "2222222222",
                password: hashedPassword,
                role: "USER",
            },
        ],
    });
}

async function down() {
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Folder" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "File" RESTART IDENTITY CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "VerificationCode" RESTART IDENTITY CASCADE`;
}

async function main() {
    try {
        await down();
        await up();
    } catch (e) {
        console.log(e);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.log(e);
        await prisma.$disconnect();
        process.exit(1);
    });
