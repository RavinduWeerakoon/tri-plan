import React, { useState } from "react";
import { Box, Button, Input, VStack, HStack, Text, Container, Center } from "@chakra-ui/react";

interface Message {
  text: string;
  sender: "user" | "bot";
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");

  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    const userMessage: Message = { text: userInput, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    });
    const data = await response.json();
    const botMessage: Message = { text: data.message, sender: "bot" };
    setMessages((prev) => [...prev, userMessage, botMessage]);
  };

  // Define color shades
  const primaryColor = "rgb(223, 81, 115)";
  const lightPrimaryColor = "rgba(223, 81, 115, 0.2)"; // lighter shade of primary color
  const darkPrimaryColor = "rgba(223, 81, 115, 0.8)"; // darker shade of primary color

  return (
    <Container
      maxW="lg"
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
      p={4}
      boxShadow="lg"
      bg="white"
      mt={0}
      mb={6}
    >
      <VStack spacing={4} align="stretch">
        <Box
          w="100%"
          h="400px"
          overflowY="auto"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          bg="gray.50"
          boxShadow="sm"
          position="relative"
        >
          <VStack spacing={4} align="stretch">
            {messages.length === 0 ? (
              <Center h="100%">
                <Text textAlign="center" color="gray.600" fontSize="lg" fontWeight="light">
                  Explore locations with our AI bot. Ask for cafes, cultural spots, or getaways and get instant recommendations.
                </Text>
              </Center>
            ) : (
              messages.map((msg, index) => (
                <HStack
                  key={index}
                  justify={msg.sender === "user" ? "flex-end" : "flex-start"}
                  spacing={4}
                >
                  <Box
                    p={3}
                    borderRadius="md"
                    maxW="75%"
                    bg={msg.sender === "user" ? primaryColor : "white"}
                    color={msg.sender === "user" ? "white" : darkPrimaryColor}
                    borderWidth="1px"
                    borderColor={msg.sender === "user" ? primaryColor : "gray.200"}
                    boxShadow="md"
                    transition="background-color 0.3s, transform 0.3s"
                    _hover={{ 
                      bg: msg.sender === "user" ? lightPrimaryColor : "gray.100",
                      transform: "scale(1.02)"
                    }}
                  >
                    {msg.text}
                  </Box>
                </HStack>
              ))
            )}
          </VStack>
        </Box>
        <HStack spacing={4} w="100%">
          <Input
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            bg="white"
            _placeholder={{ color: "gray.500" }}
            transition="border-color 0.3s, box-shadow 0.3s"
            _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
          />
          <Button
            borderWidth="1px"
            borderColor="gray.200"
            backgroundColor={primaryColor}
            color="white"
            borderRadius="md"
            onClick={sendMessage}
            _hover={{ bg: "rgba(223, 81, 115, 0.8)" }}
            _active={{ bg: "rgba(223, 81, 115, 0.9)" }}
            transition="background-color 0.3s"
          >
            Send
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
};

export default Chatbot;
