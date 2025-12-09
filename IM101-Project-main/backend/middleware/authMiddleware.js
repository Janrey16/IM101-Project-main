const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.verifyToken = (req, res, next) => {
  console.log(req.headers); 
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token missing' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

exports.verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Token missing' });
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid token' });
      
      // Get user from database to check role
      const [users] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
      if (users.length === 0) return res.status(404).json({ message: 'User not found' });
      
      const user = users[0];
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
