import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Button, Image, Text, Icon } from "@chakra-ui/react";
import { FiUploadCloud } from "react-icons/fi";
import { supabaseClient } from "../../utility/supabaseClient"; // Import your Supabase client
import { useParsed } from "@refinedev/core";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

const ImageUpload = ({ bucket_name, handleUpload }) => {
  // Accept projectId and a callback as props
  const { params } = useParsed();
  const [imageSrc, setImageSrc] = useState(null);
  const [uploadBtn, setUploadBtn] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  });

  function base64ToFile(base64, filename) {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const uploadImageToSupabase = async (imageSrc, filename) => {
    // Convert the base64-encoded image to a File object
    const file = base64ToFile(imageSrc, filename);

    // Sanitize the filename by replacing characters that aren't letters, numbers, '.', or '-'
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Upload the file to Supabase storage within the specified bucket and folder
    const { data, error } = await supabaseClient.storage
      .from("project-img") // Use the bucket_name here to specify the bucket
      .upload(`${bucket_name}/${sanitizedFilename}`, file);

    console.log(data, error); // Debugging log

    // If an error occurs during the upload, log it and return null
    if (error) {
      <Alert status="error">
        <AlertIcon />
        Error uploading file
      </Alert>;
      console.error("Error uploading file:", error.message);
      return null;
    }

    // Construct the public URL to access the uploaded file
    const fullPath = `https://sacpcuhbfmpwrkbaxdmu.supabase.co/storage/v1/object/public/${bucket_name}/${data.path}`;

    // Return the public URL of the uploaded image
    return fullPath;
  };

  // const handleUpload = async () => {
  //   if (imageSrc && imageFile) {
  //     console.log("Uploading image to Supabase...", imageFile.name);
  //     const filename = `${Date.now()}-${imageFile.name}`;
  //     const imageUrl = await uploadImageToSupabase(imageSrc, filename);
  //     if (imageUrl) {
  //       console.log("Image uploaded to Supabase:", imageUrl);
  //       console.log(params);

  //       // Insert the full path into the image_link column of your database
  //       const { data, error } = await supabaseClient
  //         .from("projects") // Assuming your table is named 'projects'
  //         .update({ image_link: imageUrl }) // Update the image_link column
  //         .eq("id", params?.id); // Update the row where id matches projectId

  //       if (error) {
  //         console.error(
  //           "Error updating image link in database:",
  //           error.message
  //         );
  //       } else {
  //         console.log("Image link updated in database:", data);
  //         setUploadBtn(false);
  //       }
  //     }
  //   }
  // };

  return (
    <Box p={4}>
      <Box
        {...getRootProps()}
        border="2px dashed"
        borderColor={isDragActive ? "blue.500" : "gray.300"}
        p={6}
        textAlign="center"
        cursor="pointer"
        borderRadius="md"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Text>Drop the image here...</Text>
        ) : (
          <>
            <Icon as={FiUploadCloud} w={10} h={10} color="gray.500" mb={4} />
            <Text>Drag & drop an image here, or click to select one</Text>
            <Button mt={2}>Browse</Button>
          </>
        )}
      </Box>
      {imageSrc && uploadBtn && (
        <Box mt={4}>
          <Image src={imageSrc} alt="Uploaded image" maxH="300px" />
        </Box>
      )}
      {uploadBtn && imageSrc && (
        <Box mt={4}>
          <Button
            mt={4}
            colorScheme="blue"
            onClick={() =>
              handleUpload(
                imageSrc,
                imageFile,
                uploadImageToSupabase,
                supabaseClient,
                setUploadBtn
              )
            }
          >
            Upload
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
