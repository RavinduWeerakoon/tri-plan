import React, { useEffect, useState } from "react";
import {
  IResourceComponentsProps,
  useNavigation,
  useParsed,
} from "@refinedev/core";
import { DateField, Edit } from "@refinedev/chakra-ui";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  Flex,
  Switch,
  Box,
} from "@chakra-ui/react";
import { useForm } from "@refinedev/react-hook-form";
import { PROJECT_STATUS } from "../../utility/constants";
import dayjs from "dayjs";
import ImageUpload from "../../components/image-upload";

export const ProjectEdit: React.FC<IResourceComponentsProps> = () => {
  const {
    refineCore: { formLoading, queryResult },
    register,
    saveButtonProps,
    formState: { errors },
  } = useForm();
  const projectsData = queryResult?.data?.data;
  const todaysDate = dayjs(new Date()).format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(
    dayjs(projectsData?.start_date).format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs(projectsData?.end_date).format("YYYY-MM-DD")
  );

  useEffect(() => {
    if (projectsData?.start_date)
      setStartDate(dayjs(projectsData?.start_date).format("YYYY-MM-DD"));
    if (projectsData?.end_date)
      setEndDate(dayjs(projectsData?.end_date).format("YYYY-MM-DD"));
  }, [projectsData]);

  const handleUpload = async (
    imageSrc,
    imageFile,
    uploadImageToSupabase,
    supabaseClient,
    setUploadBtn
  ) => {
    const { params } = useParsed();
    if (imageSrc && imageFile) {
      console.log("Uploading image to Supabase...", imageFile.name);
      const filename = `${Date.now()}-${imageFile.name}`;
      const imageUrl = await uploadImageToSupabase(imageSrc, filename);
      if (imageUrl) {
        console.log("Image uploaded to Supabase:", imageUrl);
        console.log(params);

        // Insert the full path into the image_link column of your database
        const { data, error } = await supabaseClient
          .from("projects") // Assuming your table is named 'projects'
          .update({ image_link: imageUrl }) // Update the image_link column
          .eq("id", params?.id); // Update the row where id matches projectId

        if (error) {
          console.error(
            "Error updating image link in database:",
            error.message
          );
        } else {
          console.log("Image link updated in database:", data);
          setUploadBtn(false);
        }
      }
    }
  };
  return (
    <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box py={4} px={8} marginLeft={{ base: "-10", md: "0" }}>
        <FormControl mb="3" isInvalid={!!(errors as any)?.title}>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            {...register("title", {
              required: "This field is required",
            })}
          />
          <FormErrorMessage>
            {(errors as any)?.title?.message as string}
          </FormErrorMessage>
        </FormControl>
        <FormControl mb="3" isInvalid={!!(errors as any)?.image_link}>
          <FormLabel>Project Image</FormLabel>
          <ImageUpload bucket_name={"images"} handleUpload={handleUpload} />
        </FormControl>
        <FormControl mb="3" isInvalid={!!(errors as any)?.destination}>
          <FormLabel>Destination</FormLabel>
          <Input
            type="text"
            {...register("destination", {
              required: "This field is required",
            })}
          />
          <FormErrorMessage>
            {(errors as any)?.destination?.message as string}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb="3" isInvalid={!!(errors as any)?.description}>
          <FormLabel>Description</FormLabel>
          <Textarea
            size="sm"
            {...register("description", {
              required: "This field is required",
            })}
          />
          <FormErrorMessage>
            {(errors as any)?.description?.message as string}
          </FormErrorMessage>
        </FormControl>
        <Flex gap={4}>
          <FormControl mb="3" isInvalid={!!(errors as any)?.status}>
            <FormLabel>Status</FormLabel>
            <Select
              id="status"
              defaultValue={projectsData?.status}
              {...register("status", {
                required: "This field is required",
              })}
            >
              <option
                value={PROJECT_STATUS.PLANNING}
                key={PROJECT_STATUS.PLANNING}
              >
                {PROJECT_STATUS.PLANNING}
              </option>
              <option
                value={PROJECT_STATUS.COMPLETED}
                key={PROJECT_STATUS.COMPLETED}
              >
                {PROJECT_STATUS.COMPLETED}
              </option>
            </Select>
            <FormErrorMessage>
              {(errors as any)?.status?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl mb="3" isInvalid={!!(errors as any)?.private}>
            <FormLabel>Private</FormLabel>
            <Switch id="private" {...register("private", {})} />
            <FormErrorMessage>
              {(errors as any)?.private?.message as string}
            </FormErrorMessage>
          </FormControl>
        </Flex>
        <Flex gap={4}>
          <FormControl mb="3">
            <FormLabel>Start Date</FormLabel>
            <Input
              type="date"
              {...register("start_date", {})}
              onChange={(e) => setStartDate(e.target.value)}
              min={todaysDate}
              value={startDate}
            />
            <FormErrorMessage>
              {(errors as any)?.start_date?.message as string}
            </FormErrorMessage>
          </FormControl>
          <FormControl mb="3">
            <FormLabel>End Date</FormLabel>
            <Input
              type="date"
              {...register("end_date", {})}
              onChange={(e) => setEndDate(e.target.value)}
              value={endDate}
              min={todaysDate}
            />

            <FormErrorMessage>
              {(errors as any)?.end_date?.message as string}
            </FormErrorMessage>
          </FormControl>
        </Flex>
      </Box>
    </Edit>
  );
};
