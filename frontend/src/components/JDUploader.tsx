import React, { useState } from "react";
import { Text, Input, Button, VStack, HStack, useToast } from "@chakra-ui/react";
import axios from "axios";

type Weights = { education: number; experience: number; skills: number };

interface Props {
  weights: Weights;
  onCandidates: (rows: any[]) => void;
}

const API_BASE = "https://vanshita111-cvalign-backend.hf.space";

const JDUploader: React.FC<Props> = ({ weights, onCandidates }) => {
  const [resumeFiles, setResumeFiles] = useState<FileList | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
      toast({ title: "Resumes uploaded successfully!", status: "success" });
    } catch (e: any) {
      toast({ title: "Resume Upload Failed", description: e.message, status: "error" });
    }
  };

  const pollResults = async (jobId: string) => {
    const start = Date.now();
    while (Date.now() - start < 180000) { // 3-minute timeout
      try {
        const res = await axios.get(`${API_BASE}/resume/results/`, {
          params: { job_id: jobId },
        });
        if (res.status === 200 && res.data?.status !== "pending") {
          return res.data;
        }
      } catch (error) {}
      await new Promise((r) => setTimeout(r, 3000)); // Wait 3 seconds
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
    form.append("use_llm", "true");
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
          description: "This may take a moment, please wait.",
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
    } catch (e: any) {
      toast.closeAll();
      toast({
        title: "Analysis Failed",
        description: e?.response?.data?.detail || e.message,
        status: "error",
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
          <Input type="file" multiple accept=".pdf,.docx" onChange={(e) => setResumeFiles(e.target.files)} />
        </VStack>
        <Button onClick={uploadResumes} colorScheme="teal" alignSelf="flex-end" mt="auto">Upload Resumes</Button>
      </HStack>
      <HStack spacing={4}>
        <VStack align="stretch" flex="1">
          <Text fontWeight="semibold">Upload JD & Analyze</Text>
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