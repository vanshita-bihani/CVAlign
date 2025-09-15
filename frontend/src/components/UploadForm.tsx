// src/components/UploadForm.tsx (updated)
import React, { useState } from "react";
import axios from "axios";
import API_BASE from "../config";

const UploadForm: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!files) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await axios.post(
        `${API_BASE}/resume/upload-resumes/`
,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setStatus("✅ Uploaded: " + (res.data.files_uploaded || res.data.files || []).join(", "));

    } catch (err: any) {
      setStatus("❌ Upload failed: " + err.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Upload Resumes</h2>
      <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      <button
        onClick={handleUpload}
        className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Upload
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
};

export default UploadForm;
