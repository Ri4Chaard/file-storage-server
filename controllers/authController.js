const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.addUser = async (req, res) => {
    const { phone } = req.body;

    try {
        const candidate = await prisma.user.findFirst({
            where: {
                phone,
            },
        });

        if (candidate) {
            return res
                .status(400)
                .json({ error: "Such phone already registered." });
        }

        const newUser = await prisma.user.create({
            data: {
                phone,
            },
        });
        res.status(201).json({
            message: "Phone successfully registered.",
            user: newUser,
        });
    } catch (e) {
        res.status(500).json({ error: "Phone registration failed." });
    }
};

exports.register = async (req, res) => {
    const { phone, login, password } = req.body;

    try {
        const candidate = await prisma.user.findFirst({
            where: {
                phone,
            },
        });

        if (!candidate || !candidate.verified) {
            return res.status(400).json({
                error: !candidate
                    ? "Phone number not found. Please contact the admin."
                    : "User not verified.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.update({
            where: { phone },
            data: {
                login,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            message: "User successfully registered.",
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({ error: "Registration failed." });
    }
};

exports.login = async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { login } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};
