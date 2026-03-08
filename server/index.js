const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.get('/api/message', (req, res) => {
  res.json({ message: "Привет от Node.js сервера! 👋" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});