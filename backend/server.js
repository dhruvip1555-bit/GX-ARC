require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const contactRouter = require('./routes/contact');
const requestAccessRouter = require('./routes/requestAccess');

const app = express();
const PORT = process.env.PORT || 4000;

/* ── CORS — strict origin check ── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    /* Allow same-origin requests (origin is undefined for server-to-server / curl) */
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
}));

/* ── Body parsing ── */
app.use(express.json({ limit: '16kb' }));

/* ── Rate limiting — 10 submissions per IP per 15 minutes ── */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions — please try again later.' },
});

/* ── Serve the frontend ── */
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/* ── API routes ── */
app.use('/api/contact', formLimiter, contactRouter);
app.use('/api/request-access', formLimiter, requestAccessRouter);

/* ── Health check (no timestamp — avoids leaking server clock info) ── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/* ── SPA fallback ── */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

/* ── Global error handler — never leak stack traces ── */
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`[GX-Arc] Server running → http://localhost:${PORT}`);
});
