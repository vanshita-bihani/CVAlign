import React, { useState } from "react";
import axios from "axios";
import API_BASE from "../config";


const AnalyzeSection: React.FC = () => {
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [result, setResult] = useState<any[] | null>(null); // State for the final results
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(""); // State to show progress

  // ✅ Fixed polling function
const pollResults = async (jobId: string) => {
  const start = Date.now();
  while (Date.now() - start < 180000) { // 3-minute timeout
    try {
      // ✅ FIXED: use /resume/results/{jobId} instead of query param
      const res = await axios.get(`${API_BASE}/resume/results/${jobId}`);
      
      if (res.status === 200) {
        return res.data; // Backend returned final results
      }
    } catch (error) {
      // Ignore until timeout
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Analysis timed out.");
};


  // ✅ 3. Updated handleAnalyze to use the polling logic
  const handleAnalyze = async (): Promise<void> => {
    if (!jdFile) {
      setStatus("Please select a Job Description file first.");
      return;
    }
    const formData = new FormData();
    formData.append("jd_file", jdFile);
    formData.append("use_llm", "true"); // Set to true to get AI feedback

    setLoading(true);
    setResult(null);
    setStatus("Starting analysis...");

    try {
      // Start the analysis job
      const startRes = await axios.post(`${API_BASE}/resume/analyze/`, formData);
      
      if (startRes.status === 202 && startRes.data?.job_id) {
        const jobId = startRes.data.job_id;
        setStatus("Analysis in progress... This may take a moment.");
        
        // Wait for the results
        const finalResult = await pollResults(jobId);
        setResult(finalResult);
        setStatus("Analysis complete!");
      } else {
        throw new Error("Backend did not start the job correctly.");
      }

    } catch (error: any) {
      console.error("Analysis failed", error);
      setStatus(`Error: ${error.message || "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload Job Description</h2>
      <input
        type="file"
        accept=".pdf,.txt,.docx"
        onChange={(e) => setJdFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {/* ✅ 4. Improved UI to show status and formatted results */}
      {status && <p className="text-gray-600">{status}</p>}

      {result && result.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Analyzed Candidates:</h3>
          <div className="space-y-4">
            {result.map((r: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                <p><b>Name:</b> {r.name}</p>
                <p><b>Score:</b> {r.score}%</p>
                {r.strengths && r.strengths.length > 0 && <p><b>Strengths:</b> {r.strengths.join(", ")}</p>}
                {r.weaknesses && r.weaknesses.length > 0 && <p><b>Weaknesses:</b> {r.weaknesses.join(", ")}</p>}
                {r.feedback && <p><b>Feedback:</b> {r.feedback}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeSection;