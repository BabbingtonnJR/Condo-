require('dotenv').config();
const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Condo+ rodando em http://localhost:${PORT}`);
});
