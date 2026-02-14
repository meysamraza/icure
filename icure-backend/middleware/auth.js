const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.sendStatus(403); // Forbidden
  }
};

const isPatient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.sendStatus(403); // Forbidden
  }
};

module.exports = {
  authenticateToken,
  isDoctor,
  isPatient,
};
