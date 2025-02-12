const jwt = require("jsonwebtoken");

const SECRET_KEY = "336aa64a46bc046c582d411fcd8a424cde5bc5c5f6965df5fff9f8451c84e9d3";

function authenticateToken(req, res, next) {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: "Invalid authorization format" });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified; // Attach user payload to request
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token", error: error.message });
    }
}

function authorizeRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeRole };
