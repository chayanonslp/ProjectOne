const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
//อ่างอิงไปที่ Router
const router = require('./routes/index');

const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// กำหนด view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// เสิร์ฟไฟล์ static
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors({
  origin: 'http://localhost:3000', // URL ของ React frontend
  credentials: true // เพื่อให้ cookie จาก express-session ส่งได้
}));

// กำหนด session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 วัน
  }
}));

// ใช้ router
app.use('/', router);
// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
