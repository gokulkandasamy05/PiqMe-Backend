require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const app = express();
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const path = require('path');
const cors = require('cors');
require('./utils/cronjob');
const http = require('http');
const initializeSocket = require('./utils/socket');
const chatRouter = require('./routes/chat');

// ✅ Make Express trust Nginx / Cloudflare proxy headers
app.set('trust proxy', true);

// ✅ Force HTTPS only if not secure and not localhost
app.use((req, res, next) => {
  if (req.get('x-forwarded-proto') !== 'https' && req.hostname !== 'localhost') {
    return res.redirect(301, 'https://' + req.headers.host + req.url);
  }
  next();
});

// ✅ CORS
app.use(cors({
  origin: ['http://localhost:3001', 'https://piqme.live'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ✅ Routes
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', chatRouter);

// ✅ Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ Create HTTP server for Socket.IO
const server = http.createServer(app);
initializeSocket(server);

// ✅ Connect DB and start server
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
    server.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed', err);
  });
