const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.register = async (req, res) => {
    const { login, phone, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const candidate = await prisma.user.findFirst({
            where: {
                OR: [{ login }, { phone }, { email }],
            },
        });

        if (candidate) {
            return res
                .status(400)
                .json({ error: "User with such data already exist" });
        }

        const newUser = await prisma.user.create({
            data: {
                login,
                phone,
                email,
                password: hashedPassword,
                role: role || "USER",
            },
        });

        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: "Unable to create user" });
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
