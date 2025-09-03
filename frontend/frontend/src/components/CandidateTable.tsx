// src/components/CandidateTable.tsx
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Box, Text, Badge, Collapse, Button, Flex 
} from '@chakra-ui/react';
import React, { useState } from 'react';

interface Candidate {
  name?: string;
  score?: number;
  education?: string;
  experience?: string;
  skills_matched?: string[];
  original_filename?: string;
  strengths?: string[];
  weaknesses?: string[];
  feedback?: string;
}

const CandidateTable = ({ candidates }: { candidates: Candidate[] }) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
    <Flex mt={8} align="flex-start" gap={8}>
      {/* Candidate Table */}
      <Box flex="2" p={4} bg="rgba(10, 25, 47, 0.95)" borderRadius="md" boxShadow="md">
        <Text fontSize="xl" fontWeight="bold" color="white" mb={4}>
          Analyzed Candidates
        </Text>
        <Table variant="simple">
          <Thead bg="rgba(255,255,255,0.1)">
            <Tr>
              <Th color="white">Name</Th>
              <Th color="white">Score</Th>
              <Th color="white">Education</Th>
              <Th color="white">Experience</Th>
              <Th color="white">Matched Skills</Th>
              <Th color="white">Details</Th>
            </Tr>
          </Thead>
          <Tbody>
            {candidates.map((c, i) => (
              <React.Fragment key={i}>
                <Tr>
                  <Td color="white">{c.name || c.original_filename || 'Unknown'}</Td>
                  <Td color="white">{c.score ?? '-'}</Td>
                  <Td color="white">{c.education || 'N/A'}</Td>
                  <Td color="white">{c.experience || 'N/A'}</Td>
                  <Td>
                    {(c.skills_matched ?? []).map((skill, j) => (
                      <Badge key={j} mr={1} colorScheme="green">
                        {skill}
                      </Badge>
                    ))}
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    >
                      {expandedRow === i ? "Hide" : "View"}
                    </Button>
                  </Td>
                </Tr>
                <Tr>
                  <Td colSpan={6} p={0}>
                    <Collapse in={expandedRow === i} animateOpacity>
                      <Box p={4} bg="rgba(255,255,255,0.08)" rounded="md" shadow="md">
                        <Text fontWeight="bold" color="white">Strengths:</Text>
                        <ul>
                          {(c.strengths ?? []).map((s, idx) => (
                            <li key={idx} style={{ color: "lightgreen" }}>{s}</li>
                          ))}
                        </ul>

                        <Text fontWeight="bold" mt={2} color="white">Weaknesses:</Text>
                        <ul>
                          {(c.weaknesses ?? []).map((w, idx) => (
                            <li key={idx} style={{ color: "salmon" }}>{w}</li>
                          ))}
                        </ul>

                        <Text fontWeight="bold" mt={2} color="white">Feedback:</Text>
                        <Text color="whiteAlpha.900">
                          {c.feedback || "No feedback available."}
                        </Text>
                      </Box>
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

export default CandidateTable;
