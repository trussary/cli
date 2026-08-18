// Intentionally vulnerable fixture: an open proxy to a paid model API.
const express = require('express');
const OpenAI = require('openai');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/chat', async (req, res) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: req.body.prompt }],
  });
  res.json(completion);
});

module.exports = router;
