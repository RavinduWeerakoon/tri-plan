// Chatbot.tsx
import React, { useState } from 'react';
import { Box, Input, Button, VStack, HStack, Text, Flex, SimpleGrid, Card, CardBody } from '@chakra-ui/react';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ question: string; response: { response: string; suggested_places: { Title: string; image_path: string }[] } }[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Dummy response generator
  const generateResponse = async (question: string) => {
  //   const res = {
  //     "response": "Okay! So you're looking for a beach in Sri Lanka. Let's explore these options: \n\n* **Kalkudah Beach (Score: 60):** Kalkudah is known for its long stretch of golden sand and calm turquoise waters, perfect for swimming, sunbathing, and simply relaxing. It's also a great place for watersports like windsurfing and kitesurfing. The beach is located in the eastern province, which is less developed than the south coast, making it a more tranquil and secluded option. \n\n* **Beruwala Beach (Score: 45):** Beruwala is a popular beach destination located on the south coast of Sri Lanka. It offers a good mix of things to do, from swimming and sunbathing to watersports and shopping. The beach is also known for its beautiful sunsets. It's a bit more lively than Kalkudah, with a good selection of restaurants and cafes. \n\n* **Mirissa Beach (Score: 8):** Mirissa is a charming little beach town located on the south coast of Sri Lanka. It's known for its stunning beaches, clear waters, and excellent whale watching opportunities. The beach is also home to a number of restaurants, bars, and shops. Mirissa is a great option for those seeking a more laid-back and authentic experience.\n\n* **Induruwa Beach (Score: 53):** Induruwa is a beautiful beach located on the south coast of Sri Lanka. It's known for its pristine white sand and clear blue waters, which are perfect for swimming, sunbathing, and snorkeling. The beach is also relatively secluded, making it a great escape from the hustle and bustle of other tourist destinations. \n\nDo you have any preferences in mind like watersports, nightlife, or seclusion?  This would help me narrow down the options further! \n",
  //     "suggested_places": [
  //         {
  //             "Title": "60. Kalkudah Beach",
  //             "image_path": "http://127.0.0.1:8000/static/images/default.jpg"
  //         },
  //         {
  //             "Title": "45. Beruwala",
  //             "image_path": "http://127.0.0.1:8000/static/images/45. Beruwala/0.jpg"
  //         },
  //         {
  //             "Title": "8. Mirissa",
  //             "image_path": "http://127.0.0.1:8000/static/images/8. Mirissa/0.jpg"
  //         },
  //         {
  //             "Title": "53. Induruwa",
  //             "image_path": "http://127.0.0.1:8000/static/images/default.jpg"
  //         }
  //     ]
  // };
  //   return res;

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
            <Text>{msg.response["response"]}</Text>

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
