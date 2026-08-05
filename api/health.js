/* GET/POST /api/health — geen afhankelijkheden, geen env vars nodig.
   Uitsluitend om te bevestigen dat Vercel de /api-map als serverless
   functions bouwt en aanroept. Geeft altijd {"status":"ok"} terug. */

module.exports = (req, res) => {
  res.status(200).json({ status: 'ok' });
};
