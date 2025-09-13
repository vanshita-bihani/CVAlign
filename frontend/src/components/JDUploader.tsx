// frontend/src/components/JDUploader.tsx

import React, { useState } from "react";
import { Text, Input, Button, VStack, HStack, useToast } from "@chakra-ui/react";
import axios from "axios";

type Weights = { education: number; experience: number; skills: number };

interface Props {
  weights: Weights;
  onCandidates: (rows: any[]) => void;
}

// Ensure this URL is correct and your backend is running on this port
const API_BASE = "http://127.0.0.1:8010";

const JDUploader: React.FC<Props> = ({ weights, onCandidates }) => {
  const [resumeFiles, setResumeFiles] = useState<FileList | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // ✅ Function with improved error handling
  const showUploadError = (title: string, error: any) => {
    let description = "An unknown error occurred.";
    if (error.response) {
      // The server responded with an error status (4xx or 5xx)
      description = `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // The request was made but no response was received
      description = "No response from server. Is the backend running and accessible at " + API_BASE + "?";
    } else {
      // Something else happened while setting up the request
      description = error.message;
    }
    console.error(title, error);
    toast({ title, description, status: "error", duration: 9000, isClosable: true });
  };

  const uploadResumes = async () => {
    if (!resumeFiles || resumeFiles.length === 0) {
      toast({ title: "Please choose resume files", status: "warning" });
      return;
    }
    const form = new FormData();
    Array.from(resumeFiles).forEach(f => form.append("files", f));

    try {
      await axios.post(`${API_BASE}/resume/upload-resumes/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ title: "Resumes uploaded successfully!", status: "success", isClosable: true });
    } catch (error) {
      showUploadError("Resume Upload Failed", error);
    }
  };

  const pollResults = async (jobId: string) => {
    const start = Date.now();
    while (Date.now() - start < 180000) { // 3-minute timeout
      try {
        const res = await axios.get(`${API_BASE}/resume/results/${jobId}`);
        if (res.status === 200 && res.data?.status !== "pending") {
          return res.data;
        }
      } catch (error) { /* Ignore errors during polling, timeout will handle it */ }
      await new Promise((r) => setTimeout(r, 3000));
    }
    throw new Error("Analysis timed out.");
  };

  const analyze = async () => {
    if (!jdFile) {
      toast({ title: "Please upload a JD first", status: "warning" });
      return;
    }
    const form = new FormData();
    form.append("jd_file", jdFile);
    form.append("education_weight", String(weights.education));
    form.append("experience_weight", String(weights.experience));
    form.append("skills_weight", String(weights.skills));

    setLoading(true);
    onCandidates([]);
    
    try {
      const startRes = await axios.post(`${API_BASE}/resume/analyze/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (startRes.status === 202 && startRes.data?.job_id) {
        const jobId = startRes.data.job_id;
        toast({
          id: 'polling-toast',
          title: "Analysis in progress...",
          status: "info",
          duration: null,
          isClosable: false,
        });

        const finalResult = await pollResults(jobId);
        onCandidates(finalResult);
        toast.close('polling-toast');
        toast({ title: "Analysis Complete!", status: "success" });
      } else {
        throw new Error("Backend did not start the analysis job correctly.");
      }
    } catch (error) {
      toast.closeAll();
      showUploadError("Analysis Failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack align="stretch" spacing={5}>
      <HStack spacing={4}>
        <VStack align="stretch" flex="1">
          <Text fontWeight="semibold">1. Upload Resumes</Text>
          <Input type="file" multiple accept=".pdf,.docx" onChange={(e) => setResumeFiles(e.target.files)} />
        </VStack>
        <Button onClick={uploadResumes} colorScheme="teal" alignSelf="flex-end" mt="auto">Upload Resumes</Button>
      </HStack>
      <HStack spacing={4}>
        <VStack align="stretch" flex="1">
          <Text fontWeight="semibold">2. Upload JD & Analyze</Text>
          <Input type="file" accept=".pdf,.txt,.docx" onChange={(e) => setJdFile(e.target.files?.[0] || null)} />
        </VStack>
        <Button onClick={analyze} colorScheme="green" isLoading={loading} alignSelf="flex-end" mt="auto">
          Analyze
        </Button>
      </HStack>
    </VStack>
  );
};

export default JDUploader;