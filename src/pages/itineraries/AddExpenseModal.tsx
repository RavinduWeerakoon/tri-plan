import React, { useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  Stack,
  IconButton,
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { supabaseClient } from "../../utility";
import { COLORS } from "../../utility/colors";
import { IconPlus } from "@tabler/icons-react";
import DropBox from "../../components/dropbox";
import { useGetIdentity, useParsed } from "@refinedev/core";
import { IUser } from "../../utility/interface";
import { set } from "react-hook-form";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: any;
  added_User: any;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  projectId,
  added_User,
}) => {
  const [formData, setFormData] = useState({
    date: "",
    price: 0,
    description: "",
    time: "",
    items: [{ name: "", count: 1 }],
    project_id: "",
  });

  const { data: user } = useGetIdentity<IUser>();
  const { params } = useParsed();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData((prevData) => ({ ...prevData, items: updatedItems }));
  };

  const addItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      items: [...prevData.items, { name: "", count: 1 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      items: prevData.items.filter((_, i) => i !== index),
    }));
  };

  const [dropbox, setdropbox] = useState(true);

  const showdropbox = () => {
    setdropbox(!dropbox);
  };

  let Bill_link: null = null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemList = formData.items.map((item) => {
      return item.name;
    });

    const { error } = await supabaseClient.from("bills").insert([
      {
        date: formData.date || new Date().toISOString().split("T")[0],
        price: formData.price || 0,
        description: formData.description || "No description",
        time: formData.time,
        items: itemList,
        project_id: projectId,
        added_user: added_User,
        Bill_link: Bill_link,
      },
    ]);
    if (error) {
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error inserting bill data into Database!</AlertTitle>
      </Alert>;
      const { error } = await supabaseClient
        .from("bills")
        .delete()
        .match({ Bill_link: Bill_link });
      console.error("Error inserting bill data into Supabase:", error?.message);
    } else {
      setShowAlert(true);
      console.log("Bill data successfully inserted into Supabase!");
      setFormData({
        date: "",
        price: 0,
        description: "",
        time: "",
        items: [{ name: "", count: 1 }],
        project_id: "",
      });
      setdropbox(false);
      onClose();
    }
  };

  const handleDropBox = async (
    imageSrc: any,
    imageFile: string | Blob,
    uploadImageToSupabase: (arg0: any, arg1: string) => any,
    supabaseClient: any,
    setUploadBtn: (arg0: boolean) => void
  ) => {
    if (imageSrc && imageFile) {
      console.log("Uploading image to Supabase...", (imageFile as File).name);
      const filename = `${Date.now()}-${(imageFile as File).name}`;
      const imageUrl = await uploadImageToSupabase(imageSrc, filename);

      if (imageFile) {
        console.log("Image uploaded to Supabase:", imageUrl);
        Bill_link = imageUrl;

        const formData = new FormData();
        formData.append("file", imageFile);
        try {
          const response = await fetch(
            "http://139.59.15.179:8000/extract-info/",
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await response.json();

          if (response.ok) {
            console.log("Image successfully processed by API:", data);

            const { date, amount, time, items } = data;

            setFormData((prevData) => ({
              ...prevData,
              date: date || new Date().toISOString().split("T")[0],
              price: amount || 0,
              time: time,
              items: items || [],
            }));

            setUploadBtn(false);
          } else {
            console.error("Error :", data);
          }
        } catch (error) {
          <Alert status="error">
            <AlertIcon />
            Error while processing image!
          </Alert>;
          console.error("Error while sending:", error);
        }
        setUploadBtn(false);
      }
    }
  };

  const [showAlert, setShowAlert] = useState(false);

  return (
    <>
      {showAlert && (
        <Alert status="success">
          <AlertIcon />
          Bill data successfully inserted into Database!
        </Alert>
      )}
      <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
        <ModalOverlay
          bg="none"
          backdropFilter="auto"
          backdropInvert="80%"
          backdropBlur="2px"
        />
        <ModalContent maxWidth={{ base: "100%", md: "500px" }}>
          <ModalHeader>Add Expense</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Button
              bg={COLORS.primaryColor}
              leftIcon={<IconPlus />}
              onClick={showdropbox}
              color={COLORS.white}
              marginBottom={4}
            >
              Scan Bill
            </Button>
            {dropbox && <DropBox bucket_name="bill-image" />}

            <form onSubmit={handleSubmit}>
              <FormControl mb={4}>
                <FormLabel>Date</FormLabel>
                <Input
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  type="date"
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Price</FormLabel>
                <Input
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  type="number"
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Time</FormLabel>
                <Input
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  type="time"
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Items</FormLabel>
                {formData.items.map((item, index) => {
                  return (
                    <Stack key={index} spacing={3} mb={3}>
                      <Stack direction="row" spacing={2} align="center">
                        <Input
                          placeholder="Item Name"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, "name", e.target.value)
                          }
                        />
                        <IconButton
                          aria-label="Remove Item"
                          icon={<FaTrash />}
                          onClick={() => removeItem(index)}
                          variant="outline"
                          colorScheme="red"
                        />
                      </Stack>
                    </Stack>
                  );
                })}
                <Button mt={2} onClick={addItem} colorScheme="teal">
                  Add Item
                </Button>
              </FormControl>
              <Button mt={4} colorScheme="blue" type="submit">
                Submit
              </Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddExpenseModal;
