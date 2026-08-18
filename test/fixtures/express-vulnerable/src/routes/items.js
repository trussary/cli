// Intentionally vulnerable fixture: query built from a URL value, body saved as-is.
const express = require('express');
const router = express.Router();

router.get('/items/search', async (req, res) => {
  const rows = await db.query('select * from items where name like ' + req.query.q);
  res.json(rows);
});

router.post('/items', async (req, res) => {
  const saved = await db.insert('items', req.body);
  res.json(saved);
});

module.exports = router;
