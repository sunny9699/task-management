const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Authenticate user
async function authenticateUser(req, res, next) {
    try {
        const authorizationToken = req.header('Authorization');
        if(!authorizationToken) {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const jwtToken = authorizationToken.replace('Bearer ', '');
        const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

        if (!payload) {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        };
        req.user = payload;
        next();
    } catch (error) {
        console.log(error);
        
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }
}

module.exports = authenticateUser;