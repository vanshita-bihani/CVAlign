import React from "react";
import {
  Box, Text, Slider, SliderTrack, SliderFilledTrack, SliderThumb, VStack, HStack, Badge
} from "@chakra-ui/react";

type Weights = { education: number; experience: number; skills: number };

interface Props {
  weights: Weights;
  onChange: (w: Weights) => void;
}

const WeightageSlider: React.FC<Props> = ({ weights, onChange }) => {
  const total = weights.education + weights.experience + weights.skills;

  const update = (k: keyof Weights) => (v: number) =>
    onChange({ ...weights, [k]: v });

  return (
    <VStack align="stretch" spacing={5}>
      <Box>
        <HStack justify="space-between" mb={1}>
          <Text>Education (%)</Text><Badge>{weights.education}</Badge>
        </HStack>
        <Slider min={0} max={100} value={weights.education} onChange={update("education")}>
          <SliderTrack><SliderFilledTrack /></SliderTrack><SliderThumb />
        </Slider>
      </Box>

      <Box>
        <HStack justify="space-between" mb={1}>
          <Text>Experience (%)</Text><Badge>{weights.experience}</Badge>
        </HStack>
        <Slider min={0} max={100} value={weights.experience} onChange={update("experience")}>
          <SliderTrack><SliderFilledTrack /></SliderTrack><SliderThumb />
        </Slider>
      </Box>

      <Box>
        <HStack justify="space-between" mb={1}>
          <Text>Skills (%)</Text><Badge>{weights.skills}</Badge>
        </HStack>
        <Slider min={0} max={100} value={weights.skills} onChange={update("skills")}>
          <SliderTrack><SliderFilledTrack /></SliderTrack><SliderThumb />
        </Slider>
      </Box>

      <Text fontSize="sm" opacity={0.8}>
        Total: <b>{total}%</b> (doesn’t need to be exactly 100; weights are normalized in scoring)
      </Text>
    </VStack>
  );
};

export default WeightageSlider;
