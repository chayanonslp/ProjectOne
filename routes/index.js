const express = require('express');
const router = express.Router();
const db = require('../config/db'); // path ตามโครงสร้างโปรเจกต์
// รองรับการอ่าน req.body จากฟอร์ม
router.use(express.urlencoded({ extended: false }));

// Middleware สำหรับส่ง user ไปทุก view
router.use((req, res, next) => {
  res.locals.user_name = req.session.user_name ?? undefined; // ถ้าไม่มี user จะได้เป็น null
  next();
});

// Middleware สำหรับบังคับให้ login ก่อนเข้า route
function requireLogin(req, res, next) {
  console.log('Checking login status...', req.session.user_name);
  if (!req.session.user_name) {
    // ถ้าไม่มี session user ให้ redirect ไปหน้า login
    return res.redirect('/login');
  }
  next();
}



router.get('/', (req, res) => {
  console.log('Rendering index page for user:', req.session.user_name);
  // ใช้ session user เพื่อส่งข้อมูลไปยัง view
  let user_name = req.session.user_name;
  res.render('index', {
    title:'หน้าแรก',
    message: user_name ? `ยินดีต้อนรับ ${user_name}!` : 'สวัสดีจาก EJS!'
  });
});

router.get('/about', requireLogin, (req, res) => {
  res.render('about', { title: 'เกี่ยวกับเรา' });
});


router.get('/login', (req, res) => {
  res.render('login', { title: 'เข้าสู่ระบบ' });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE user_email = $1', [username]);
    const user = result.rows[0];

    if (user && password === user.user_password_hash) {
      req.session.user_name = user.user_name;
      return res.redirect('/');
    }
    res.render('login', { title: 'เข้าสู่ระบบ', error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  } catch (error) {
    console.error('Error during login:', error);
    res.render('login', { title: 'เข้าสู่ระบบ', error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});
// แสดงฟอร์ม register
router.get('/register', (req, res) => {
  res.render("register", {
    user_id: "",
    user_email: "",
    user_name: req.session.user_name,
    user_phone: "",
    error: "",
    title: 'สมัครสมาชิก'
  });
});
// รับข้อมูลจากฟอร์ม register
router.post('/register', async (req, res) => {
  try {
    const { user_email, user_password_hash, user_name, user_phone } = req.body;
    console.log('Registering user:', user_email, user_name, user_phone, user_password_hash);
    // เพิ่มผู้ใช้ใหม่ลง database
    await db.query(
      `INSERT INTO users 
         (user_email, user_password_hash, user_name, user_phone, user_is_active, role_id, role_code, user_created_at, user_updated_at) 
       VALUES 
         ($1, $2, $3, $4, $5, 2, 'USR', NOW(), NOW())`,
      [user_email, user_password_hash, user_name, user_phone, 0]
    );

    res.redirect('/login'); // สมัครเสร็จ redirect ไป login
  } catch (error) {
    console.error("Error during register:", error);
    res.render("register", {
      error:  error.code === '23505' ? ' (อีเมลนี้ถูกใช้ไปแล้ว)' : '',
      user_email: req.body.user_email,
      user_name: undefined,
      user_phone: req.body.user_phone,
      title: 'สมัครสมาชิก'
    });
  }
});
router.get('/logout', (req, res) => {
  console.log('Logging out user:', req.session.user_name);
  // ลบ session และ redirect ไปหน้าแรก
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// เส้นทางสำหรับหน้า 404
router.use((req, res) => {
  req.session.destroy(() => {
     res.status(404).render('404', { title: 'ไม่พบหน้า' });
  });
});


module.exports = router;
