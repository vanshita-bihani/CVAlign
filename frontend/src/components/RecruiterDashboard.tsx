// frontend/src/components/RecruiterDashboard.tsx

import {
  Box, Heading, VStack, Text, useToast,
  NumberInput, NumberInputField, HStack, Divider
} from '@chakra-ui/react';
import React, { useState } from 'react';
import CandidateTable from './CandidateTable';
import JDUploader from './JDUploader'; // Import the corrected uploader

// Define the shape of a candidate object
interface Candidate {
  name: string;
  score: number;
  // Add other properties as they exist in your data
  [key: string]: any;
}

const RecruiterDashboard = () => {
  const [weights, setWeights] = useState({ education: 20, experience: 30, skills: 50 });
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const toast = useToast();

  const handleWeightChange = (value: string | number, name: keyof typeof weights) => {
    const numValue = Number(value);
    setWeights(prev => ({ ...prev, [name]: numValue }));
  };

  const handleAnalysisComplete = (candidateData: Candidate[]) => {
    if (Array.isArray(candidateData)) {
      setCandidates(candidateData);
      toast({
        title: `Analysis complete. Found ${candidateData.length} candidates.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      console.error("Received non-array data for candidates:", candidateData);
      setCandidates([]);
      toast({
        title: "An error occurred during analysis.",
        description: "Received an unexpected data format.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // This function is no longer needed as the JDUploader handles it.
  // We keep it here to show how to apply filters if you re-run analysis locally.
  const handleFilter = () => {
    toast({
      title: "To re-rank with new weights, please analyze again.",
      description: "The weights are sent to the backend during the analysis step.",
      status: "info",
      duration: 4000,
    });
  };

  return (
    <Box
      minHeight="100vh"
      bgImage="url('/background.jpg')"
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPosition="center"
      px={8}
      py={12}
      color="white"
      backdropFilter="auto"
      backdropBlur="4px"
    >
      <Box bg="rgba(13, 35, 72, 0.9)" p={8} borderRadius="md" maxW="1200px" mx="auto">
        <Heading size="lg" mb={6} textAlign="center">CVAlign v2: AI-Powered Resume Analyzer</Heading>
        <VStack align="stretch" spacing={6}>

          {/* Section 1: Set Weights */}
          <Box>
            <Text fontWeight="semibold" mb={3} fontSize="lg">1. Set Parameter Weightage</Text>
            <HStack spacing={4} justify="center">
              <Box textAlign="center">
                <Text>Education (%)</Text>
                <NumberInput value={weights.education} min={0} max={100} onChange={(val) => handleWeightChange(val, 'education')}>
                  <NumberInputField />
                </NumberInput>
              </Box>
              <Box textAlign="center">
                <Text>Experience (%)</Text>
                <NumberInput value={weights.experience} min={0} max={100} onChange={(val) => handleWeightChange(val, 'experience')}>
                  <NumberInputField />
                </NumberInput>
              </Box>
              <Box textAlign="center">
                <Text>Skills (%)</Text>
                <NumberInput value={weights.skills} min={0} max={100} onChange={(val) => handleWeightChange(val, 'skills')}>
                  <NumberInputField />
                </NumberInput>
              </Box>
            </HStack>
            <Text fontSize="sm" mt={2} textAlign="center" color="gray.400">
              Ensure weights add up to 100.
            </Text>
          </Box>

          <Divider borderColor="gray.600" />

          {/* Section 2: Upload Files and Analyze */}
          <Box>
             <Text fontWeight="semibold" mb={3} fontSize="lg">2. Upload Files & Run Analysis</Text>
            {/* The JDUploader component now handles all file I/O and analysis logic */}
            <JDUploader
              weights={weights}
              onCandidates={handleAnalysisComplete}
            />
          </Box>


          {/* Section 3: Results */}
          {candidates.length > 0 && (
            <Box>
              <Divider borderColor="gray.600" my={6} />
              <Heading size="md" mb={4}>Candidate Analysis Results</Heading>
              <CandidateTable candidates={candidates} />
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default RecruiterDashboard;