const express = require("express");
const multer = require("multer");

const { uploadCertificate } = require("../controllers/uploadController");
const { verifyCertificate } = require("../controllers/verifyController");

const router = express.Router();

// FIXED storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// ROUTES
router.post("/upload", upload.single("file"), uploadCertificate);
router.post("/verify", upload.single("file"), verifyCertificate);

module.exports = router;