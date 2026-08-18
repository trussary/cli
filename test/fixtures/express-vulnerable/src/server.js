// Intentionally vulnerable fixture.
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*', credentials: true }));

app.get('/api/items', async (req, res) => {
  try {
    res.json(await listItems());
  } catch (err) {
    res.status(500).json({ error: err.stack });
  }
});

app.listen(3000);
