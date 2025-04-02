const jwt = require('jsonwebtoken');

const SECRET_KEY = 'secret_key'; // Hard-code for this assignment

const authenticate = (req, res, next) => {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' }); // No token provided
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Attach decoded user to request
        next(); // Proceed to next middleware
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const requireClearance = (requiredRole) => {
    return (req, res, next) => {
        const decoded = req.user

        if (!decoded) {
          return res.status(401).json({error: 'Unauthorized'});
        }
  
        // Check user clearance (role)
        const roleHierarchy = ['regular', 'cashier', 'manager', 'superuser'];
        if (roleHierarchy.indexOf(decoded.role.toLowerCase()) < roleHierarchy.indexOf(requiredRole.toLowerCase())) {
          console.log(decoded.role, requiredRole);
          return res.status(403).json({ error: 'Insufficient clearance' });
        }
  
        next(); // User has enough clearance — continue to the next step 
    };
  };

module.exports = { authenticate, requireClearance };
