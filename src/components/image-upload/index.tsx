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

interface ImageUploadProps {
  project_id: string;
  type: string; // Add the type property
}

const ImageUpload: React.FC<ImageUploadProps> = ({ project_id, type }) => {  // Accept projectId and a callback as props
  const { params } = useParsed();
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);
  const [uploadBtn, setUploadBtn] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
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


  let pathName = '';
  if(type === "edit"){
    pathName = `images/${project_id}`;
  } else if(type === "gallery"){
    pathName = `gallery/${project_id}`;
  }

  function base64ToFile(base64: string, filename: string) {
    const arr = base64.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async function uploadImageToSupabase(imageSrc: string, filename: string) {
    const file = base64ToFile(imageSrc, filename);

    const sanitizedFilename = filename.replace(/\s+/g, "_");
    const { data, error } = await supabaseClient.storage
      .from("project-img")
      .upload(`${pathName}/${sanitizedFilename}`, file);

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

  const handleUpload = async () => {
    if (imageSrc && imageFile) {
      const filename = `${Date.now()}-${imageFile.name}`;
      const imageUrl = await uploadImageToSupabase(imageSrc as string, filename);
      if (imageUrl) {
        if(type === "edit"){
          // Insert the full path into the image_link column of your database
          const { data, error } = await supabaseClient
            .from("projects") // Assuming your table is named 'projects'
            .update({ image_link: imageUrl }) // Update the image_link column
            .eq("id", params?.id); // Update the row where id matches projectId
            if (error) {
              console.error("Error updating image link in database:", error.message);
            } else {
              console.log("Image link updated in database:", data);
              setImageSrc(null);
              
            }
        } else if(type === "gallery"){
          setImageSrc(null);
        }

      }
    }
  };

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
          <Text>Preview:</Text>
          <Image src={typeof imageSrc === 'string' ? imageSrc : undefined} alt="Uploaded image" maxH="300px" />

        </Box>
      )}
      <Box mt={4}>
        <Button mt={4} colorScheme="blue" onClick={handleUpload} isDisabled={!imageSrc}  >
          Upload
        </Button>
      </Box>
      
    </Box>
  );
};

export default ImageUpload;
