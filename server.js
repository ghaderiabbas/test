// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '200kb' }));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const STORE = path.join(__dirname, 'fingerprints.log');

app.post('/collect', (req, res) => {
  const entry = { ...req.body, receivedAt: new Date().toISOString(), ip: req.ip };
  fs.appendFile(STORE, JSON.stringify(entry) + '\n', err => {
    if (err) return res.status(500).send('error');
    res.status(204).send();
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));