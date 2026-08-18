// Intentionally vulnerable fixture: a placeholder signing secret, fake values.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function login(req, res) {
  const user = await db.query('select * from users where email = $1', [req.body.email]);
  const ok = await bcrypt.compare(req.body.password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'nope' });
  return res.json({ token: jwt.sign({ sub: user.id }, 'supersecret') });
}

module.exports = { login };
