require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Expense Tracker server is running!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(process.env.PORT, () => console.log('Server started on port ' + process.env.PORT));
  })
  .catch(err => console.log('MongoDB error ❌', err.message));
  app.use('/api/expenses', require('./routes/expenses'));