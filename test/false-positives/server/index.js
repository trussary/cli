// An express app with the safe form of everything the deploy rules look for.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(helmet());
app.use(cors({ origin: ['https://example.com', 'http://localhost:3000'], credentials: true }));
app.use('/api/login', rateLimit({ windowMs: 60_000, max: 5 }));

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET,
  );
  if (event.type === 'checkout.session.completed') {
    db.query('update accounts set paid = true where id = $1', [event.data.object.id]);
  }
  res.json({ received: true });
});

app.get('/api/items', async (req, res) => {
  try {
    const rows = await db.query('select * from items where name like $1', [req.query.q]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'something went wrong' });
  }
});

app.listen(3000);
