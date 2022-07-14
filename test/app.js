const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

const mongoURI=process.env.MONGODBURI || 'mongodb://localhost:27017/test';

mongoose.connect(mongoURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Database connected successfully"))
.catch((err) => console.log(err.message));

app.use('/user', require('./routes/user.route'));
app.use('/', require('./routes/transactions.route'));

app.get('/', async (req, res, next) => {
  res.send({ message: 'Awesome it works 🐻' });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
