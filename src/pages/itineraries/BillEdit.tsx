import React, { useEffect, useState } from "react";
import {
  useUpdate,
  useOne,
  HttpError,
  IResourceComponentsProps,
} from "@refinedev/core";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { IProject, IUser, IBill } from "../../utility/interface";
import { COLORS } from "../../utility/colors";

export const BillEdit: React.FC<IResourceComponentsProps> = () => {
  const { mutate } = useUpdate<HttpError>();
  const { id } = useParams(); // Get the bill ID from the URL
  const navigate = useNavigate();

  const [billData, setBillData] = useState<IBill | null>(null);

  const { data: bill, isLoading } = useOne<IBill, HttpError>({
    resource: "bills",
    id: id, // Fetch the bill data by ID
  });

  useEffect(() => {
    if (bill) {
      setBillData(bill.data);
    }
  }, [bill]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillData((prev) => ({
      ...prev,
      items: { ...prev?.items, [name]: Number(value) },
    }));
  };

  const handleSubmit = () => {
    if (billData) {
      mutate({
        resource: "bills",
        id: billData.id,
        values: billData,
        onSuccess: () => {
          navigate(`/bills`); // Navigate back to the bill list after success
        },
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box p={8}>
      <Heading>Edit Bill</Heading>
      {billData && (
        <Box mt={6}>
          {/* Description */}
          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={billData.description}
              onChange={handleInputChange}
              placeholder="Enter a description"
            />
          </FormControl>

          {/* Price */}
          <FormControl mb={4}>
            <FormLabel>Price</FormLabel>
            <Input
              name="price"
              type="number"
              step="0.01"
              value={billData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
            />
          </FormControl>

          {/* Time */}
          <FormControl mb={4}>
            <FormLabel>Time</FormLabel>
            <Input
              name="time"
              type="time"
              value={billData.time}
              onChange={handleInputChange}
              placeholder="Select time"
            />
          </FormControl>

          {/* Items (Assuming items is an object with item names and counts) */}
          <FormControl mb={4}>
            <FormLabel>Items</FormLabel>
            {Object.entries(billData.items).map(([item, count], index) => (
              <Flex key={index} mb={2} gap={2}>
                <Input value={item} name={item} isReadOnly />
                <Input
                  value={count}
                  type="number"
                  name={item}
                  onChange={handleItemsChange}
                  placeholder={`Count for ${item}`}
                />
              </Flex>
            ))}
          </FormControl>

          {/* Submit Button */}
          <Button colorScheme="blue" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Box>
      )}
    </Box>
  );
};
