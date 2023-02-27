
const jwt = require('jsonwebtoken');
const config = require('../../src/config/config');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        next();
    });
};

const authAdminMiddleware = (requiredRole) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        if (requiredRole && decoded.role !== requiredRole) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        next();
    });
};


module.exports = {
    authMiddleware,
    authAdminMiddleware
};