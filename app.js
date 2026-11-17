require('dotenv').config(); // завантажує .env у process.env — до require контролера, якому потрібні ключі
require('express-async-errors'); // помилки з async-контролерів самі йдуть в errorHandler, без try/catch

const express = require('express');
const app = express();

const sendEmail = require('./controllers/sendEmail');
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());

// routes
app.get('/', (req, res) => {
  res.send('<h1>Email Project</h1> <a href="/send">send email</a>');
});

app.get('/send', sendEmail); // GET для демо: лист іде при кожному відкритті сторінки (у реальному API — POST)

app.use(notFoundMiddleware); // після всіх маршрутів: спрацьовує, коли жоден не підійшов
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
