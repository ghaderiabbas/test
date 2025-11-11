// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '200kb' }));

// Serve static files (HTML, JS, etc.) from "public"
app.use(express.static(path.join(__dirname, 'public')));

// CORS (keep open for now; restrict in production)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// File to store fingerprints
const STORE = path.join(__dirname, 'fingerprints.log');

// Collect endpoint
app.post('/collect', (req, res) => {
  const entry = { ...req.body, receivedAt: new Date().toISOString(), ip: req.ip };
  fs.appendFile(STORE, JSON.stringify(entry) + '\n', err => {
    if (err) {
      console.error('write error', err);
      return res.status(500).send('error');
    }
    res.status(204).send();
  });
});

// Use dynamic port for hosting
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
