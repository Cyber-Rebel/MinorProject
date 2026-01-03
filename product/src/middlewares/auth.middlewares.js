const jwt = require('jsonwebtoken');

function createauthMiddleware(roles = ['user']) {
    // Normalize roles to always be an array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return function authMiddleware(req, res, next) {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        console.log('Cookies:', req.cookies);
        console.log('Token:', token);
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.jwt);
            console.log('Decoded token:', decoded);
            console.log('User role:', decoded.role);
            console.log('Allowed roles:', allowedRoles);
            
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ 
                    message: 'Forbidden: Insufficient rights',
                    userRole: decoded.role,
                    requiredRoles: allowedRoles
                });
            }
            
            req.user = decoded; // Attach user info to request object
            next();
        } catch (err) {
            console.error('Token verification error:', err.message);
            return res.status(401).json({ message: 'Invalid token', error: err.message });
        }
    };   
}

module.exports = { createauthMiddleware };