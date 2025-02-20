const jwt = require("jsonwebtoken");

const SECRET_KEY = "336aa64a46bc046c582d411fcd8a424cde5bc5c5f6965df5fff9f8451c84e9d3";

function authenticateToken(req, res, next) {
    const authHeader = req.header("Authorization");
    console.log("Auth Header:", authHeader);
    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);
    if (!token) {
        return res.status(401).json({ message: "Invalid authorization format: Bearer token expected" });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        console.log("Verified Token Payload:", verified);
        req.user = verified;
        next();
    } catch (error) {
        console.error("Token Verification Error:", error.stack);
        res.status(403).json({ message: "Invalid or expired token", error: error.message });
    }
}

function authorizeRole(role) {
    return (req, res, next) => {
        console.log("Authorizing - User Role:", req.user?.role, "Expected Role:", role);
        if (!req.user || req.user.role.toLowerCase() !== role.toLowerCase()) {
            console.log("Role Mismatch - User:", req.user?.role, "Required:", role);
            return res.status(403).json({
                message: "Access Denied: Insufficient permissions",
                userRole: req.user?.role,
                requiredRole: role
            });
        }
        console.log("Role Authorized Successfully");
        next();
    };
}

module.exports = { authenticateToken, authorizeRole };