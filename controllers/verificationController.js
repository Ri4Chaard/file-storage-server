const { sendVerificationCode } = require("../lib/sendVerificationCode");
const { generateVerificationCode } = require("../lib/generateVerificationCode");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.sendCode = async (req, res) => {
    const { phone } = req.body;

    try {
        const existingCode = await prisma.verificationCode.findFirst({
            where: {
                phone,
                expiresAt: { gte: new Date() },
            },
        });

        if (existingCode) {
            return res.status(200).json({
                expiresAt: existingCode.expiresAt,
                error: "Verification code already sent. Please wait before requesting a new one.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return res.status(404).json({
                error: "Phone number not found. Please contact the admin.",
            });
        }

        if (user.password) {
            return res.status(200).json({
                registered: true,
                message: "User already verified",
            });
        }

        if (user.verified) {
            return res.status(200).json({
                verified: true,
                message: "User already verified",
            });
        }

        const verificationCode = generateVerificationCode();
        await sendVerificationCode(phone, verificationCode);

        await prisma.verificationCode.create({
            data: {
                phone,
                code: verificationCode,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        res.status(200).json({
            message: "Verification code sent to your phone.",
        });
    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ error: "Error registering user." });
    }
};

exports.verifyUser = async (req, res) => {
    const { phone, code } = req.body;
    try {
        const verification = await prisma.verificationCode.findFirst({
            where: {
                phone,
                code,
                expiresAt: { gte: new Date() },
            },
        });

        if (!verification) {
            return res
                .status(400)
                .json({ error: "Invalid or expired verification code." });
        }
        await prisma.user.update({
            where: { phone },
            data: {
                verified: true,
            },
        });

        await prisma.verificationCode.deleteMany({
            where: { phone },
        });

        res.status(200).json({
            user: phone,
            message: "User successfully verified.",
        });
    } catch (e) {
        res.status(500).json({ error: "Verification failed." });
    }
};
