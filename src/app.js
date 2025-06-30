const express = require('express')
const connectDB = require('./config/database')
const app = express()
const cookieParser = require('cookie-parser');


app.use(express.json())
app.use(cookieParser())


const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')

app.use('/', authRouter)
app.use('/', profileRouter)

connectDB().then(con => {
  console.log('MongoDB connected successfully');
  app.listen(3000, () => {
    console.log('Server is running on port 3000')
  })
}).catch(err => {
  console.error('MongoDB connection failed', err);
});


