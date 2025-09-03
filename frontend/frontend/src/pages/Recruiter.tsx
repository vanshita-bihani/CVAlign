import React from "react";
import { Box } from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import ResumeAnalytics from "../components/ResumeAnalytics";

const Recruiter = () => {
  return (
    <Box display="flex" minH="100vh" bgGradient="linear(to-r, #0b132b, #1c3faa)">
      <Sidebar />
      <Box flex="1">
        <ResumeAnalytics />
      </Box>
    </Box>
  );
};

export default Recruiter;
