import jwt from 'jsonwebtoken';

const jwtCookieName = 'auth_token';

export const authenticateToken = (req, res, next) => {
  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  // If no Authorization header, try to get from cookies
  const cookieToken = req.cookies?.[jwtCookieName];
  
  const finalToken = token || cookieToken;
  
  if (!finalToken) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
