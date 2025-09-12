import React from "react";
import { HStack, Button, useToast } from "@chakra-ui/react";

interface Props {
  rows: any[];
}

const ExportButtons: React.FC<Props> = ({ rows }) => {
  const toast = useToast();

  const toCSV = () => {
    if (!rows?.length) {
      toast({ title: "Nothing to export", status: "warning" });
      return;
    }
    const headers = [
      "name","original_filename","score","semantic_score","education","experience","skills_matched","strengths","weaknesses","raw_feedback"
    ];
    const esc = (v:any) => {
      if (v == null) return "";
      if (Array.isArray(v)) v = v.join(" | ");
      v = String(v).replace(/"/g, '""');
      return `"${v}"`;
    };
    const lines = [
      headers.join(","),
      ...rows.map(r => headers.map(h => esc((r as any)[h])).join(","))
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analysis.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", status: "success" });
  };

  const printPDF = () => {
    window.print(); // simple & works everywhere
  };

  return (
    <HStack spacing={3}>
      <Button onClick={toCSV} colorScheme="blue" variant="solid">Export CSV</Button>
      <Button onClick={printPDF} variant="outline">Print / Save as PDF</Button>
    </HStack>
  );
};

export default ExportButtons;
