import React, { useState } from "react";
import { COLORS } from "../../utility/colors";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Container,
  Center,
} from "@chakra-ui/react";

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

  return (
    <Container
      maxW="md"
      borderWidth="1px"
      borderRadius="lg"
      borderColor={COLORS.primaryColor}
      p={4}
    >
      <VStack spacing={4}>
        <Box
          w="100%"
          h="300px"
          overflowY="auto"
          borderWidth="1px"
          border="2px"
          borderColor={COLORS.primaryColor}
          borderRadius="md"
          p={2}
          display={messages.length === 0 ? "flex" : "block"}
          alignItems={messages.length === 0 ? "center" : "initial"}
          justifyContent={messages.length === 0 ? "center" : "initial"}
        >
          <VStack spacing="3px">
            {messages.length === 0 ? (
              <Text textAlign="center" color="gray.500">
                Explore locations easily with our AI bot. Just ask for cafes,
                cultural spots, or peaceful getaways, and get instant
                recommendations. It's that simple!
              </Text>
            ) : (
              messages.map((msg, index) => (
                <HStack
                  key={index}
                  justify={msg.sender === "user" ? "flex-end" : "flex-start"}
                  w="100%"
                >
                  <Text
                    bg={msg.sender === "user" ? "yellow.200" : "gray.100"}
                    borderColor={COLORS.primaryColor}
                    borderRadius="md"
                    p={2}
                    maxW="75%"
                  >
                    {msg.text}
                  </Text>
                </HStack>
              ))
            )}
          </VStack>
        </Box>
        <HStack w="100%">
          <Input
            border="2px"
            borderColor={COLORS.primaryColor}
            borderRadius="md"
            placeholder="Message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <Button
            border="1px"
            borderColor={COLORS.primaryColor}
            backgroundColor={COLORS.primaryColor}
            borderRadius="md"
            onClick={sendMessage}
          >
            Send
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
};

export default Chatbot;
