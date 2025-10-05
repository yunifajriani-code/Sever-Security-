const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 80;

// ===== Middleware =====
app.use(bodyParser.json());

// API Key sederhana
const API_KEY = "12345"; // ganti dengan key yang aman

function authMiddleware(req, res, next) {
  const clientKey = req.headers["x-api-key"];
  if (clientKey !== API_KEY) {
    return res
      .status(401)
      .json({ message: "Unauthorized: API key tidak valid" });
  }
  next();
}

// ====== Fungsi Masking ======
function maskValue(value) {
  if (typeof value === "number") {
    if (value === 100) return "***"; // masking khusus untuk 100
    if (value > 90) return 90; // nilai max 90
  }
  return value;
}

function maskObject(obj) {
  let result = {};
  for (let key in obj) {
    result[key] = maskValue(obj[key]);
  }
  return result;
}

// ====== Logging Middleware ======
function loggingMiddleware(req, res, next) {
  const maskedBody = maskObject(req.body);
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} | Body:`,
    maskedBody
  );
  next();
}

app.use(loggingMiddleware);

// ===== DATA SEDERHANA =====
let users = [
  { id: 1, nama: "Yuni", kelas: "D4 Elektronika" },
  { id: 2, nama: "Nini", kelas: "Informatika" },
];

// ====== GET (ambil semua data) ======
app.get("/dummy-get", authMiddleware, (req, res) => {
  res.json({
    message: "Ini adalah GET API",
    data: users,
  });
});

// ====== POST (tambah data baru) ======
app.post("/dummy-post", authMiddleware, (req, res) => {
  try {
    const data = {
      nama: req.body.nama,
      kelas: req.body.kelas,
      nilai: req.body.nilai, // contoh tambahan nilai untuk masking
    };

    const newId = users.length ? users[users.length - 1].id + 1 : 1;
    const newUser = { id: newId, ...data };

    users.push(newUser);

    res.json({
      message: "Data baru berhasil ditambahkan",
      data: newUser,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ====== PUT (update data berdasarkan id) ======
app.put("/dummy-put/:id", authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  let updatedUser = null;

  try {
    const data = {
      nama: req.body.nama,
      kelas: req.body.kelas,
      nilai: req.body.nilai,
    };

    users = users.map((user) => {
      if (user.id === id) {
        updatedUser = { ...user, ...data };
        return updatedUser;
      }
      return user;
    });

    if (updatedUser) {
      res.json({
        message: `Data dengan id ${id} berhasil diupdate`,
        data: updatedUser,
      });
    } else {
      res.status(404).json({ message: `Data dengan id ${id} tidak ditemukan` });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ====== DELETE (hapus data berdasarkan id) ======
app.delete("/dummy-delete/:id", authMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const beforeLength = users.length;
  users = users.filter((user) => user.id !== id);

  if (users.length < beforeLength) {
    res.json({
      message: `Data dengan id ${id} berhasil dihapus`,
      sisaData: users,
    });
  } else {
    res.status(404).json({ message: `Data dengan id ${id} tidak ditemukan` });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});