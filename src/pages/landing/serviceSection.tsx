import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";

import GuidedTourImage from "../../assets/guided-tour.jpg";
import FlightsImage from "../../assets/best-flight.jpg";
import ReligiousToursImage from "../../assets/religious-tour.jpg";
import MedicalInsuranceImage from "../../assets/medical-insurance.jpg";
const services = [
  {
    title: "Guided Tours",
    description:
      "sunt qui repellat saepe quo velit aperiam id aliquam placeat.",
    image: GuidedTourImage, // Replace with the correct image path
  },
  {
    title: "Best Flights Options",
    description:
      "sunt qui repellat saepe quo velit aperiam id aliquam placeat.",
    image: FlightsImage,
  },
  {
    title: "Religious Tours",
    description:
      "sunt qui repellat saepe quo velit aperiam id aliquam placeat.",
    image: ReligiousToursImage,
  },
  {
    title: "Medical Insurance",
    description:
      "sunt qui repellat saepe quo velit aperiam id aliquam placeat.",
    image: MedicalInsuranceImage,
  },
];

export default function ServicesSection() {
  return (
    <Box py={10} px={6} bg="white">
      {/* Section Title */}
      <VStack spacing={2} mb={8} textAlign="center">
        <Text fontSize="sm" color="orange.500" fontWeight="bold">
          CATEGORY
        </Text>
        <Heading as="h2" fontSize="3xl" color="gray.700">
          We Offer Best Services
        </Heading>
      </VStack>

      {/* Services Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
        {services.map((service, index) => (
          <Box
            key={index}
            bg="white"
            boxShadow="xl"
            rounded="lg"
            textAlign="center"
            p={6}
            _hover={{ boxShadow: "2xl", transform: "scale(1.05)" }}
            transition="all 0.3s ease"
          >
            <Image
              src={service.image}
              alt={service.title}
              boxSize="100px"
              mx="auto"
              mb={4}
            />
            <Heading fontSize="xl" fontWeight="bold" mb={2}>
              {service.title}
            </Heading>
            <Text color="gray.500">{service.description}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
