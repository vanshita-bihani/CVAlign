// frontend/src/components/ResumeAnalytics.tsx

import React, { useState } from "react";
import { Flex, Box, Heading, VStack } from "@chakra-ui/react";
import JDUploader from "./JDUploader";
import WeightageSlider from "./WeightageSlider";
import CandidateTable from "./CandidateTable";
import ExportButtons from "./ExportButtons";

type Weights = { education: number; experience: number; skills: number };

const ResumeAnalytics: React.FC = () => {
  const [weights, setWeights] = useState<Weights>({ education: 30, experience: 40, skills: 30 });
  const [candidates, setCandidates] = useState<any[]>([]);

  // ✅ Normalizer to avoid "map is not a function"
  const normalizeCandidates = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      return Object.entries(data).map(([filename, details]: [string, any]) => ({
        name: filename,
        score: details?.score ?? 0,
        ...details,
      }));
    }
    return [];
  };

  return (
    <Flex minH="100vh" bgGradient="linear(to-r, #0b132b, #1c3faa)" color="white">
      {/* Left column */}
      <Box
        w={{ base: "100%", md: "380px" }}
        p={6}
        bg="blackAlpha.400"
        backdropFilter="auto"
        backdropBlur="6px"
      >
        <Heading size="md" mb={6}>Resume Analyzer</Heading>
        <VStack align="stretch" spacing={8}>
          <JDUploader
            weights={weights}
            onCandidates={(data) => setCandidates(normalizeCandidates(data))}
          />
          <WeightageSlider weights={weights} onChange={setWeights} />
        </VStack>
      </Box>

      {/* Right column */}
      <Box flex="1" p={8} overflowX="auto" bg="blackAlpha.200">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color="white">Candidate Analysis</Heading>
          <ExportButtons rows={candidates} />
        </Flex>
        <Box bg="whiteAlpha.100" p={4} borderRadius="md">
          <CandidateTable candidates={candidates} />
        </Box>
      </Box>
    </Flex>
  );
};

export default ResumeAnalytics;
