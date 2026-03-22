console.log("SERVER FILE LOADED ✅");
import express from "express";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const DATA_FILE = "./certificates.json";

// Load or create database file
let certificates = [];
if (fs.existsSync(DATA_FILE)) {
  certificates = JSON.parse(fs.readFileSync(DATA_FILE));
}

// ✅ FIXED ROUTE: Upload Certificate
app.post("/api/certificate/upload", upload.single("file"), (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileBuffer = fs.readFileSync(file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const certificateId = uuidv4();

    const certData = {
      id: certificateId,
      hash: hash,
      originalName: file.originalname,
    };

    certificates.push(certData);
    fs.writeFileSync(DATA_FILE, JSON.stringify(certificates, null, 2));

    fs.unlinkSync(file.path);

    res.json({
      message: "Upload successful",
      certificateId,
      hash,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED ROUTE: Verify Certificate
app.post("/api/certificate/upload", upload.single("file"), (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileBuffer = fs.readFileSync(file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const certificateId = uuidv4();

    const frontendURL = `http://192.168.0.104:3000/verify/${certificateId}`;

    // 🔥 ADD THIS LINE HERE
    console.log("QR LINK:", frontendURL);

    const certData = {
      id: certificateId,
      hash: hash,
      originalName: file.originalname,
    };

    certificates.push(certData);
    fs.writeFileSync(DATA_FILE, JSON.stringify(certificates, null, 2));

    fs.unlinkSync(file.path);

    res.json({
      certificateId,
      hash,
      verifyURL: frontendURL
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ OPTIONAL: Stats route (prevents dashboard error)
app.get("/api/certificate/stats", (req, res) => {
  res.json({
    total: certificates.length,
    verified: certificates.length,
    tampered: 0,
    pending: 0,
  });
});

app.listen(5000, () =>
  console.log("Backend running on http://localhost:5000")
);