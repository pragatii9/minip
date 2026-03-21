const db = require("../utils/db");
const generateHash = require("../utils/hash");

exports.verifyCertificate = (req, res) => {
  try {
    console.log("BODY:", req.body);

    const filePath = req.file?.path;
    let certId = req.body.certId;
certId = certId.replace(/"/g, "").trim();

    if (!filePath || !certId) {
      return res.status(400).json({ error: "Missing file or certId" });
    }

    const newHash = generateHash(filePath);

    db.get(
      "SELECT certId, hash FROM certificates WHERE certId = ?",
      [certId],
      (err, row) => {
        console.log("DB RESULT:", row);

        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!row) {
          return res.json({ status: "NOT FOUND ❌" });
        }

        if (row.hash === newHash) {
          return res.json({ status: "VALID ✅" });
        } else {
          return res.json({ status: "TAMPERED ❌" });
        }
      }
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};