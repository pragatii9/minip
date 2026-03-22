import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";

function VerifyCertificate() {
  const { id } = useParams();

  const [file, setFile] = useState(null);
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState("");

  // ✅ AUTO-FILL CERTIFICATE ID FROM QR
  useEffect(() => {
    if (id) {
      setCertificateId(id);
    }
  }, [id]);
  useEffect(() => {
  if (id && file) {
    handleVerify();   // 🔥 AUTO VERIFY TRIGGER
  }
}, [id, file]);

  const handleVerify = async () => {
    if (!file || !certificateId) {
      alert("Please enter Certificate ID and select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("certificateId", certificateId);

    try {
      const res = await fetch("http://localhost:5000/api/certificate/verify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log(data);
      setResult(data.status);

    } catch (err) {
      console.error(err);
      alert("Verification failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Verify Certificate</h2>

      {/* Certificate ID input */}
      <input
        type="text"
        placeholder="Enter Certificate ID"
        value={certificateId}
        onChange={(e) => setCertificateId(e.target.value)}
        readOnly={!!id}   // 🔥 disables editing when coming from QR
      />

      <br /><br />

      {/* File upload */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      {/* Verify button */}
      <button onClick={handleVerify}>
        Verify
      </button>

      <br /><br />

      {/* Result */}
      {result && (
        <h3 style={{ color: result === "VALID" ? "green" : "red" }}>
          Result: {result}
        </h3>
      )}
    </div>
  );
}

export default VerifyCertificate;