import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

function UploadCertificate() {
  const [file, setFile] = useState(null);
  const [certificateId, setCertificateId] = useState("");

  const handleUpload = async () => {
    console.log("BUTTON CLICKED");

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/certificate/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log(data);

      // ✅ store certificate ID
      setCertificateId(data.certificateId);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Certificate</h2>

      {/* File input */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      {/* Upload button */}
      <button onClick={handleUpload}>
        Upload
      </button>

      <br /><br />

      {/* Show Certificate ID + QR */}
      {certificateId && (
        <div>
          <h3>Certificate ID: {certificateId}</h3>

          <QRCodeCanvas
            value={`http://localhost:3000/verify?certId=${certificateId}`}
            size={200}
          />
        </div>
      )}
    </div>
  );
}

export default UploadCertificate;