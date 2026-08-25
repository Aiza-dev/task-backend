const jwt = require('jsonwebtoken');

// Helper function to extract user ID without Express next() middleware chain
const getAuthUserId = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No authentication token, authorization denied' });
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
    return null;
  }
};

module.exports = { getAuthUserId };