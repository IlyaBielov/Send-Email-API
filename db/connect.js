const mongoose = require('mongoose')

// Mongoose 6+: старі опції (useNewUrlParser, useCreateIndex, ...) прибрані — передаємо лише url
const connectDB = (url) => {
  return mongoose.connect(url)
}

module.exports = connectDB
