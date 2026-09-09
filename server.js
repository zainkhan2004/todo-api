const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello! This server is alive.');
});

app.listen(3000, () => console.log('Task API listening on http://localhost:3000'));
