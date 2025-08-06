require('dotenv').config();
// db.js
const { Pool } = require('pg');

// ใช้ .env จะปลอดภัยกว่า
// const pool = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT,
//     ssl: { rejectUnauthorized: false }
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // ใช้ connection string ของ pooler
  ssl: { rejectUnauthorized: false }          // ต้องใช้ SSL กับ Supabase
});

// ฟังก์ชันสำหรับ query กลาง ๆ ใช้งานทั่วโปรเจกต์
async function query(text, params) {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res;
    } finally {
        client.release();
    }
}


// ส่งออก pool เผื่อใช้ query ทั่วไปได้
module.exports = {query};
