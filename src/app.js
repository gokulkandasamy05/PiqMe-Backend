require('dotenv').config();
const express = require('express')
const connectDB = require('./config/database')
const app = express()
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const path = require('path');
const cors = require('cors');
require('./utils/cronjob')
const http = require('http')
const initializeSocket = require('./utils/socket');

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}))
app.use(express.json({limit: '10mb'}))
app.use(cookieParser())




app.use('/', authRouter)
app.use('/', profileRouter)
app.use('/', requestRouter)
app.use('/', userRouter)

const server = http.createServer(app)
initializeSocket(server)


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB().then(con => {
  console.log('MongoDB connected successfully');
  server.listen(3000, () => {
    console.log('Server is running on port 3000')
  })
}).catch(err => {
  console.error('MongoDB connection failed', err);
});


