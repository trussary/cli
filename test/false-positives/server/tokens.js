// Signing secret from the environment, no literal anywhere.
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET is required');

function issue(userId) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: '1h' });
}

module.exports = { issue };
