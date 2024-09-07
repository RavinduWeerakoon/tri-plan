import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Flex,
  SimpleGrid,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<
    {
      question: string;
      response: {
        response: string;
        suggested_places: { Title: string; image_path: string }[];
      };
    }[]
  >([]);
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  // Dummy response generator
  const generateResponse = async (question: string) => {

    const url = `http://139.59.15.179:3030/chat/`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: question})
    });

    return response.json(); 

  };

  // Handle user input submission
  const handleSend = async () => {
    if (inputValue.trim() === '') return;
    const response = await generateResponse(inputValue);
    setMessages([...messages, { question: inputValue, response }]);
    setInputValue("");
    setModalOpen(true);
  };

  return (
    <>
      <Flex
        direction="column"
        justifyContent="space-between"
        h="100vh"
        p="50px 20px 10px 100px"
      >
        <HStack spacing={4} ml={4}>
          {" "}
          <Input
            placeholder="Ask a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button colorScheme="blue" onClick={handleSend}>
            Send
          </Button>
        </HStack>
      </Flex>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} size="xl">
        <ModalOverlay
          bg="none"
          backdropFilter="auto"
          backdropInvert="80%"
          backdropBlur="2px"
        />
        <ModalContent>
          <ModalHeader> AI Bot</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH={"70vh"} overflowY={"auto"} overflow={"auto"}>
            {messages.map((msg, index) => (
              <Box key={index} p={4}>
                <Flex direction="column" align="flex-start" mb={4}>
                  <Box borderRadius="md" p={4} bg="gray.100" maxWidth="100%">
                    <Text>{msg.question}</Text>
                  </Box>
                </Flex>

                <Flex direction="column" align="flex-start">
                  <Box borderRadius="md" p={4} bg="gray.200" maxWidth="100%">
                    <Text mt={2} fontWeight="bold" color="green.500">
                      Bot:
                    </Text>
                    <div dangerouslySetInnerHTML={{ __html: msg.response["response"] }}></div>

                    <SimpleGrid columns={[1, 2, 3]} spacing={4} mt={4}>
                      {msg.response["suggested_places"].map((place, index) => (
                        <Card key={index}>
                          <CardBody>
                            <img src={place.image_path} alt={place.Title} />
                            <Text mt={2}>{place.Title}</Text>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                </Flex>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Chatbot;
