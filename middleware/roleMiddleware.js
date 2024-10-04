exports.isAdmin = (req, res, next) => {
    const userRole = req.userRole;

    if (userRole !== "ADMIN") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }

    next();
};
