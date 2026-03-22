const db = require("../utils/db");
const generateHash = require("../utils/hash");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const fs = require("fs");

exports.uploadCertificate = async (req, res) => {
  try {
    // 1. Check file
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    // 2. Generate hash (VERY IMPORTANT: ensure this reads file buffer)
    const hash = generateHash(filePath);

    // 3. Generate unique certificate ID
    const certId = uuidv4();

    // 4. Store in DB
    db.run(
      "INSERT INTO certificates (certId, hash, filePath) VALUES (?, ?, ?)",
      [certId, hash, filePath],
      async function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // ✅ 5. FIX: QR should point to FRONTEND
        const frontendURL = `http://192.168.0.104:3000/verify/${certificateId}`;
        // 6. Generate QR code
        const qrCode = await QRCode.toDataURL(frontendURL);

        // 7. Send response
        return res.json({
          message: "Certificate stored successfully",
          certId,
          hash,
          verifyURL: frontendURL, // useful for testing
          qrCode
        });
      }
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};