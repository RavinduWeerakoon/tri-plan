import React, { useCallback, useRef, useState } from 'react';
import {
  HttpError,
  IResourceComponentsProps,
  useGetIdentity,
  useMany,
  useParsed,
} from "@refinedev/core";
import { Create } from "@refinedev/chakra-ui";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Heading,
  Flex,
  Textarea,
  Box,
  border,
} from "@chakra-ui/react";
import { useForm } from "@refinedev/react-hook-form";
import { ACTIVITIES, ITINERARY_STATUS } from "../../utility/constants";
import { useNavigate } from "react-router-dom";
import { IProject } from "../../utility/interface";
import dayjs from "dayjs";
import { IUser } from "../../utility/interface";
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete } from '@react-google-maps/api';

export const ItineraryCreate: React.FC<IResourceComponentsProps> = () => {
  const defaultCenter = {
    lat: 6.927079,
    lng: 79.861244  
  };
  const [location, setLocation] = useState('');
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Define the handleInputChange function
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const {
    refineCore: { formLoading, onFinish },
    saveButtonProps,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { data: user } = useGetIdentity<IUser>();
  const { params } = useParsed();
  const [ids] = useState([params?.projectId]);
  const { data, isLoading, isError } = useMany<IProject, HttpError>({
    resource: "projects",
    ids,
  });
  const itineraryMinStartDate = dayjs(data?.data?.[0]?.start_date).format("YYYY-MM-DD");
  const itineraryMaxStartDate = dayjs(data?.data?.[0]?.end_date).format("YYYY-MM-DD");

  const handleSubmitItineraryCreate = (values: any) => {
    onFinish({
      ...values,
      project_id: params?.projectId,
      status: ITINERARY_STATUS.VOTING,
      media_url: [values?.media_url],
      added_by: {
        id: user?.id,
        email: user?.email,
      },
    }).then(() => navigate(`/${params?.projectId}/itinerary`));
  };
  const apiKey = process.env.VITE_REACT_APP_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const containerStyle = {
    width: '400px',
    height: '400px',
    borderRadius: '15px',
    overflow: 'hidden',
  };

  const onLoadAutocomplete = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    if (inputRef.current) {
      autocomplete.setOptions({
        types: ['geocode']
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setLocation(place.formatted_address);
          if (place.geometry && place.geometry.location) {
            setMarkerPosition({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          }
        }
      });
    }
  }, []);

  if (loadError) return <div>Error loading Google Maps script</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Create
      isLoading={isLoading || formLoading}
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSubmit(handleSubmitItineraryCreate),
      }}
      title={
        <Heading size="lg">
          {`Add itinerary item for ${data?.data?.[0]?.title}`}
        </Heading>
      }
    >
      <Box py={4} px={8}>
        <Flex gap={4} mt={8}>
          <FormControl mb="3" isInvalid={!!(errors as any)?.title}>
            <FormLabel>Title</FormLabel>
            <Input
              id="title"
              type="text"
              {...register("title", {
                required: "This field is required",
              })}
            />
            <FormErrorMessage>
              {(errors as any)?.title?.message as string}
            </FormErrorMessage>
          </FormControl>

          <FormControl mb="3" isInvalid={!!(errors as any)?.date}>
            <FormLabel>Date</FormLabel>
            <Input
              id="date"
              type="date"
              min={itineraryMinStartDate}
              max={itineraryMaxStartDate}
              {...register("date", {
                required: "This field is required",
              })}
            />
            <FormErrorMessage>
              {(errors as any)?.date?.message as string}
            </FormErrorMessage>
          </FormControl>
        </Flex>

        <Flex gap={4}>
          <FormControl mb="3" isInvalid={!!(errors as any)?.location}>
            <FormLabel>Location</FormLabel>
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={() => {
                if (autocompleteRef.current) {
                  const place = autocompleteRef.current.getPlace();
                  if (place.formatted_address) {
                    setLocation(place.formatted_address);
                    if (place.geometry && place.geometry.location) {
                      setMarkerPosition({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                      });
                    }
                  }
                }
              }}
            >
              <Input
                id="location"
                type="text"
                placeholder="Enter a location"
                {...register("location", {
                  required: "This field is required",
                })}
                value={location}
                onChange={handleInputChange}
              />
            </Autocomplete>
            <FormErrorMessage>
              {(errors as any)?.location?.message as string}
            </FormErrorMessage>
          </FormControl>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={markerPosition}
            zoom={9}
            options={{
              zoomControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            >
            <MarkerF position={markerPosition} />
          </GoogleMap>

        </Flex>

        <FormControl mb="3" isInvalid={!!(errors as any)?.media_url}>
          <FormLabel>Media URL</FormLabel>
          <Input id="media_url" type="text" {...register("media_url", {})} />
          <FormErrorMessage>
            {(errors as any)?.media_url?.message as string}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb="3" isInvalid={!!(errors as any)?.type_of_activity}>
          <FormLabel>Type of Activity</FormLabel>
          <Select
            id="type_of_activity"
            placeholder="Select activity"
            {...register("type_of_activity", {
              required: "This field is required",
            })}
          >
            {ACTIVITIES?.map((option) => (
              <option value={option.label} key={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FormErrorMessage>
            {(errors as any)?.type_of_activity?.message as string}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb="3" isInvalid={!!(errors as any)?.notes}>
          <FormLabel>Notes</FormLabel>
          <Textarea id="notes" size="sm" {...register("notes", {})} />
          <FormErrorMessage>{`${errors.notes?.message}`}</FormErrorMessage>
        </FormControl>
      </Box>
    </Create>
  );
};