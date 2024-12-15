const jwt = require("jsonwebtoken")
const SECRET_KEY = "336aa64a46bc046c582d411fcd8a424cde5bc5c5f6965df5fff9f8451c84e9d3"


function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split("")[1];
    if (!token) {
        return res.status(401).send("Access Denied: No token Provided")
    }
    try {
        const verified = jwt.verify(token, SECRET_KEY)
        req.user = verified;
        next()
    } catch (e) {
        res.status(400).send("Invalid token")
    }

}


function authorizeRole(role){
    return (req,res,next)=>{
        if(req,user,role!==role){
            return res.status(403).send("Access Denied: NOT ALLOWED")
        }

        next()
    }
}

module.exports={authenticateToken, authorizeRole}