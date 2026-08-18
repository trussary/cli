// Intentionally vulnerable fixture: the webhook trusts the body it is given.
const express = require('express');
const router = express.Router();

router.post('/webhooks/stripe', async (req, res) => {
  const event = req.body;
  if (event.type === 'checkout.session.completed') {
    await db.query('update accounts set paid = true where id = $1', [event.data.object.client_reference_id]);
  }
  res.json({ received: true });
});

module.exports = router;
