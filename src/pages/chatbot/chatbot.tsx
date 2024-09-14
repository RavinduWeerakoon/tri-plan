// Chatbot.tsx
import React, { useState } from 'react';
import { Box, Input, Button, VStack, HStack, Text, Flex } from '@chakra-ui/react';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ question: string; response: string }[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Dummy response generator
  const generateResponse = (question: string) => {
    return `This is a dummy response for: "${question}"`;
  };

  // Handle user input submission
  const handleSend = () => {
    if (inputValue.trim() === '') return;
    const response = generateResponse(inputValue);
    setMessages([...messages, { question: inputValue, response }]);
    setInputValue('');
  };

  return (
    <Flex direction="column" justifyContent="space-between" h="100vh" p={4}>
      {/* Chat Messages */}
      <VStack spacing={4} align="stretch" mb={4} flexGrow={1}>
        {messages.map((msg, index) => (
          <Box key={index} borderRadius="md" p={4} bg="gray.100">
            <Text fontWeight="bold" color="blue.500">You:</Text>
            <Text>{msg.question}</Text>
            <Text mt={2} fontWeight="bold" color="green.500">Bot:</Text>
            <Text>{msg.response}</Text>
          </Box>
        ))}
      </VStack>

      {/* Input and Send Button */}
      <HStack spacing={4}>
        <Input
          placeholder="Ask a question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button colorScheme="blue" onClick={handleSend}>
          Send
        </Button>
      </HStack>
    </Flex>
  );
};

export default Chatbot;
