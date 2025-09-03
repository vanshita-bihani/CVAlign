import React, { useState } from "react";
import axios from "axios";

const AnalyzeSection: React.FC = () => {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!jdFile) return;
    const formData = new FormData();
    formData.append("jd_file", jdFile);
    formData.append("use_llm", "false"); // You can toggle this

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/resume/analyze/", formData);
      setResult(res.data);
    } catch (error: any) {
      console.error("Analysis failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload Job Description</h2>
      <input type="file" onChange={(e) => setJdFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleAnalyze}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Analyze
      </button>
      {loading && <p>Analyzing resumes...</p>}
      {result && (
        <div className="mt-4">
          <h3 className="font-medium">Results:</h3>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AnalyzeSection;
