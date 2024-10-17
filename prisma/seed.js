const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function up() {
    const hashedPassword = await bcrypt.hash("qwerty", 10);
    await prisma.user.createMany({
        data: [
            {
                login: "user",
                password: hashedPassword,
                role: "USER",
            },
            {
                login: "admin",
                password: hashedPassword,
                role: "ADMIN",
            },
        ],
    });
}

async function down() {
    await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
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
