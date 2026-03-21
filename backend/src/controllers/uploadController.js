const db = require("../utils/db");
const generateHash = require("../utils/hash");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

exports.uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const hash = generateHash(filePath);
    const certId = uuidv4();

    db.run(
      "INSERT INTO certificates (certId, hash, filePath) VALUES (?, ?, ?)",
      [certId, hash, filePath],
      async function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const qrData = `http://localhost:5000/api/verify/${certId}`;
        const qrCode = await QRCode.toDataURL(qrData);

        return res.json({
          message: "Certificate stored successfully",
          certId,
          hash,
          qrCode
        });
      }
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};