// frontend/src/components/JDUploader.tsx
import React, { useState } from "react";
import {
  Box, Text, Input, Button, VStack, HStack, useToast
} from "@chakra-ui/react";
import axios from "axios";

type Weights = { education: number; experience: number; skills: number };

interface Props {
  weights: Weights;
  onCandidates: (rows: any[]) => void;
}

const API_BASE = "http://127.0.0.1:8001";

const JDUploader: React.FC<Props> = ({ weights, onCandidates }) => {
  const [resumeFiles, setResumeFiles] = useState<FileList | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const uploadResumes = async () => {
    if (!resumeFiles || resumeFiles.length === 0) {
      toast({ title: "Please choose one or more resume files", status: "warning", duration: 3000 });
      return;
    }
    const form = new FormData();
    Array.from(resumeFiles).forEach(f => form.append("files", f));
    try {
      const res = await axios.post(`${API_BASE}/resume/upload-resumes/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        onUploadProgress: (e) => {
          if (e.total) {
            const pct = Math.round((e.loaded / e.total) * 100);
            if (pct % 20 === 0 && pct < 100) {
              toast.closeAll();
              toast({ id: 'upload-progress', title: `Uploading Resumes… ${pct}%`, status: "info", duration: null });
            }
          }
        }
      });
      toast.closeAll();
      const uploaded = res.data?.files ?? [];
      // In JDUploader.tsx, inside the uploadResumes function...

    toast({
      title: uploaded.length 
        ? `Successfully uploaded ${uploaded.length} new resumes.` 
        : "Upload complete. Duplicates were skipped to save space.", // Better wording
      status: uploaded.length ? "success" : "info", // Changed from "warning" to "info"
      duration: 3000,
      isClosable: true,
    });
    } catch (e: any) {
      toast.closeAll();
      toast({
        title: "Resume Upload Failed",
        description: e?.response?.data?.detail || e?.message || "Network Error: Is the backend server running?",
        status: "error",
        duration: 5000
      });
    }
  };

  // Poll results until ready (or timeout)
  async function pollResults(jobId: string, maxSeconds = 180) {
    const start = Date.now();
    const timeoutMs = maxSeconds * 1000;
    while (Date.now() - start < timeoutMs) {
      try {
        // ✅ FIX: The URL no longer has the query parameter hardcoded.
        // Axios will build it from the `params` object, avoiding duplication.
        const res = await axios.get(`${API_BASE}/resume/results/`, {
          params: { job_id: jobId }
        });
        
        // Status 200 means results are ready.
        if (res.status === 200 && res.data?.status !== "pending") {
          // Check if data is an array (success) or an object with an error key (backend error)
          if (res.data.error) {
            throw new Error(`Analysis failed on backend: ${res.data.error}`);
          }
          return Array.isArray(res.data) ? res.data : [];
        }
        // If status is 202 or data contains "pending", we continue polling.
      } catch (err: any) {
        // Axios throws an error for non-2xx responses. We can ignore them while polling,
        // unless it's a critical network error not related to a 202 status.
      }
      // Wait 2 seconds before the next poll
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error(`Timeout: Results were not ready after ${maxSeconds} seconds.`);
  }

  const analyze = async () => {
    if (!jdFile) {
      toast({ title: "Please select a Job Description file first.", status: "warning" });
      return;
    }
    const form = new FormData();
    form.append("jd_file", jdFile);
    form.append("use_llm", "false");
    form.append("education_weight", String(weights.education));
    form.append("experience_weight", String(weights.experience));
    form.append("skills_weight", String(weights.skills));

    try {
      setLoading(true);
      onCandidates([]); // Clear previous results

      // Start job
      const res = await axios.post(`${API_BASE}/resume/analyze/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 15000, // Quick return expected (202)
      });

      if (res.status === 202 && res.data?.status === "started") {
        const jobId = res.data?.job_id;
        toast({
          id: 'polling',
          title: "Analysis started...",
          description: "This may take a minute. Please wait.",
          status: "info",
          duration: null, // Stays until closed
        });
        // Poll until results ready
        const rows = await pollResults(jobId);
        onCandidates(rows); // Send results to parent
        toast.close('polling');
      } else {
        throw new Error("Backend did not start the analysis job correctly.");
      }
    } catch (e: any) {
      toast.closeAll();
      toast({
        title: "Analysis Failed",
        description: e?.response?.data?.detail || e.message || "Network Error or Timeout",
        status: "error",
        duration: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack align="stretch" spacing={5}>
      <HStack spacing={4}>
        <VStack align="stretch" flex="1">
          <Text fontWeight="semibold">Upload Resumes</Text>
          <Input
            type="file"
            multiple
            accept=".pdf,.docx"
            onChange={(e) => setResumeFiles(e.target.files)}
          />
        </VStack>
        <Button onClick={uploadResumes} colorScheme="teal" alignSelf="flex-end" mt="auto">Upload Resumes</Button>
      </HStack>

      <HStack spacing={4}>
        <VStack align="stretch" flex="1">
          <Text fontWeight="semibold">Upload JD & Analyze</Text>
          <Input
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={(e) => setJdFile(e.target.files?.[0] || null)}
          />
        </VStack>
        <Button onClick={analyze} colorScheme="green" isLoading={loading} alignSelf="flex-end" mt="auto">
          Analyze
        </Button>
      </HStack>
    </VStack>
  );
};

export default JDUploader;