const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const lessons = require("./lessons");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const db = new Database(path.join(__dirname, "..", "data", "it_student.db"));

db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function tokenFor(user) {
  return jwt.sign({id:user.id}, JWT_SECRET, {expiresIn:"7d"});
}
function auth(req,res,next) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return res.status(401).json({error:"Bạn cần đăng nhập."});
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET);
    const user = db.prepare("SELECT id,username,email,avatar,created_at FROM users WHERE id=?").get(payload.id);
    if (!user) return res.status(401).json({error:"Tài khoản không tồn tại."});
    req.user = user; next();
  } catch { return res.status(401).json({error:"Phiên đăng nhập đã hết hạn."}); }
}

app.post("/api/auth/register", (req,res)=>{
  const {username,email,password} = req.body || {};
  if (!username || !email || !password) return res.status(400).json({error:"Vui lòng nhập đủ thông tin."});
  if (password.length < 6) return res.status(400).json({error:"Mật khẩu tối thiểu 6 ký tự."});
  try {
    const hash = bcrypt.hashSync(password, 12);
    const info = db.prepare("INSERT INTO users(username,email,password_hash) VALUES(?,?,?)").run(username.trim(),email.trim().toLowerCase(),hash);
    const user = db.prepare("SELECT id,username,email,avatar,created_at FROM users WHERE id=?").get(info.lastInsertRowid);
    res.json({token:tokenFor(user),user});
  } catch (e) {
    res.status(400).json({error:"Tên đăng nhập hoặc email đã tồn tại."});
  }
});

app.post("/api/auth/login",(req,res)=>{
  const {email,password} = req.body || {};
  const userRow = db.prepare("SELECT * FROM users WHERE email=?").get((email||"").trim().toLowerCase());
  if (!userRow || !bcrypt.compareSync(password||"",userRow.password_hash)) return res.status(401).json({error:"Email hoặc mật khẩu không đúng."});
  const user = {id:userRow.id,username:userRow.username,email:userRow.email,avatar:userRow.avatar,created_at:userRow.created_at};
  res.json({token:tokenFor(user),user});
});

app.get("/api/me",auth,(req,res)=>res.json(req.user));

app.post("/api/logout",auth,(_req,res)=>res.json({ok:true}));

app.get("/api/lessons",(_req,res)=>res.json(lessons.map(({id,title,url})=>({id,title,url}))));

app.get("/api/lessons/:id",auth,(req,res)=>{
  const lesson = lessons.find(x=>x.id===Number(req.params.id));
  if (!lesson) return res.status(404).json({error:"Không tìm thấy bài."});
  res.json({id:lesson.id,title:lesson.title,url:lesson.url,questions:lesson.questions});
});

app.post("/api/quiz/submit",auth,(req,res)=>{
  const {lessonId,answers} = req.body || {};
  const lesson = lessons.find(x=>x.id===Number(lessonId));
  if (!lesson || !Array.isArray(answers)) return res.status(400).json({error:"Dữ liệu bài trắc nghiệm không hợp lệ."});
  let score=0;
  lesson.questions.forEach((q,i)=>{ if(Number(answers[i])===q.c) score++; });
  db.prepare("INSERT INTO quiz_results(user_id,lesson_id,score,total) VALUES(?,?,?,?)").run(req.user.id,lesson.id,score,lesson.questions.length);
  res.json({score,total:lesson.questions.length});
});

app.get("/api/score",auth,(req,res)=>{
  const rows = db.prepare(`
    SELECT qr.lesson_id, qr.score, qr.total, qr.created_at
    FROM quiz_results qr
    WHERE qr.user_id=?
    ORDER BY qr.created_at DESC
  `).all(req.user.id);
  const total = rows.reduce((s,r)=>s+r.score,0);
  const possible = rows.reduce((s,r)=>s+r.total,0);
  res.json({results:rows,total,possible});
});

app.get("/api/leaderboard",(_req,res)=>{
  const rows = db.prepare(`
    SELECT u.username, COALESCE(SUM(q.score),0) AS score, COALESCE(SUM(q.total),0) AS total
    FROM users u LEFT JOIN quiz_results q ON q.user_id=u.id
    GROUP BY u.id ORDER BY score DESC, total DESC, u.username ASC LIMIT 100
  `).all();
  res.json(rows);
});

app.get("*",(_req,res)=>res.sendFile(path.join(__dirname,"..","public","index.html")));
app.listen(PORT,()=>console.log(`IT Student Web running on http://localhost:${PORT}`));