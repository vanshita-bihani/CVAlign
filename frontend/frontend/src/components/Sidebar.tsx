import React from "react";
import { VStack, Box, Text, Icon, HStack } from "@chakra-ui/react";
import { FiHome, FiUpload, FiSettings } from "react-icons/fi";

const Item = ({ icon, label }: { icon: any; label: string }) => (
  <HStack
    w="100%"
    px={4}
    py={3}
    borderRadius="md"
    _hover={{ bg: "whiteAlpha.200", cursor: "pointer" }}
  >
    <Icon as={icon} />
    <Text>{label}</Text>
  </HStack>
);

const Sidebar = () => {
  return (
    <VStack
      width={{ base: "100%", md: "240px" }}
      minH="100vh"
      bg="rgba(0,0,0,0.35)"
      color="white"
      spacing={2}
      align="stretch"
      p={4}
      backdropFilter="auto"
      backdropBlur="6px"
    >
      <Box px={2} py={4}>
        <Text fontSize="xl" fontWeight="bold">Recruiter</Text>
        <Text fontSize="sm" opacity={0.75}>AI Candidate Match</Text>
      </Box>
      <Item icon={FiHome} label="Dashboard" />
      <Item icon={FiUpload} label="Uploads & JD" />
      <Item icon={FiSettings} label="Settings" />
    </VStack>
  );
};

export default Sidebar;
