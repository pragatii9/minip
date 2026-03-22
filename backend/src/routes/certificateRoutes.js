const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

// SQLite DB
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    hash TEXT
  )
`);

// File upload config
const upload = multer({ dest: "uploads/" });

// ✅ UPLOAD CERTIFICATE
router.post("/certificate/upload", upload.single("file"), (req, res) => {
  try {
    console.log("API HIT");        // ✅ DEBUG
    console.log(req.file);         // ✅ DEBUG

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);

    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const certificateId = "CERT" + Date.now();

    db.run(
      `INSERT INTO certificates (id, hash) VALUES (?, ?)`,
      [certificateId, hash],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "DB error" });
        }

        res.json({
          certificateId,
          hash,
        });
      }
    );

    fs.unlinkSync(filePath);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ VERIFY CERTIFICATE
router.post("/certificate/verify", upload.single("file"), (req, res) => {
  try {
    console.log("VERIFY API HIT");   // ✅ DEBUG

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);

    const newHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    db.get(
      `SELECT hash FROM certificates WHERE id = ?`,
      [req.body.certificateId],
      (err, row) => {
        if (err || !row) {
          return res.json({ status: "NOT FOUND" });
        }

        if (row.hash === newHash) {
          res.json({ status: "VALID" });
        } else {
          res.json({ status: "TAMPERED" });
        }
      }
    );

    fs.unlinkSync(filePath);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;