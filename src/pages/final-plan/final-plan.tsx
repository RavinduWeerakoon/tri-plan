import {
  Box,
  Image,
  Text,
  Flex,
  Grid,
  GridItem,
  Button,
} from "@chakra-ui/react";
import {
  HttpError,
  useGetIdentity,
  useMany,
  useParsed,
  useTable,
} from "@refinedev/core";
import React, { useState } from "react";
import { IItinerary, IProject, IUser } from "../../utility/interface";
import TravelBagLogo from "../../assets/travel-bag.svg";
import {
  IconCalendarEvent,
  IconCircles,
  IconMapPin,
  IconPlaylistAdd,
  IconUsers,
} from "@tabler/icons-react";
import { COLORS } from "../../utility/colors";
import dayjs from "dayjs";
import { groupByDate, supabaseClient } from "../../utility";
import { ITINERARY_STATUS, PROJECT_STATUS } from "../../utility/constants";
import utc from "dayjs/plugin/utc";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);

export const FinalPlan: React.FC = () => {
  const { params } = useParsed();
  const [ids] = useState([params?.projectId]);
  const { data: user } = useGetIdentity<IUser>();
  const navigate = useNavigate();

  const { data } = useMany<IProject, HttpError>({
    resource: "projects",
    ids,
  });
  const { tableQueryResult } = useTable<IItinerary, HttpError>({
    resource: "itineraries",
    filters: {
      permanent: [
        {
          field: "project_id",
          operator: "eq",
          value: Number(params?.projectId),
        },
      ],
      defaultBehavior: "replace",
    },
  });

  const projectData = data?.data?.[0];
  const itinerariesData = tableQueryResult?.data?.data;

  const sortedData = itinerariesData?.sort((a: IItinerary, b: IItinerary) => {
    const date1 = new Date(a.date);
    const date2 = new Date(b.date);
    return date1.getTime() - date2.getTime();
  });

  const groupedData = groupByDate(sortedData || []);
  const showCloneButton = projectData?.user_id !== user?.id;

  const cloneProject = async () => {
    const projectToClone = {
      collaborators: [],
      description: projectData?.description,
      destination: projectData?.destination,
      image_link: projectData?.image_link,
      private: true,
      status: PROJECT_STATUS.PLANNING,
      title: `${projectData?.title} - Copy`,
      user_id: user?.id,
      start_date: dayjs.utc().local().format(),
      end_date: dayjs.utc().local().format(),
    };

    const { data } = await supabaseClient
      .from("projects")
      .insert(projectToClone)
      .select();

    const itinerariesToClone =
      itinerariesData?.map((itinerary) => {
        const temp = itinerary;
        delete temp.id;
        return {
          ...temp,
          added_by: { id: user?.id, email: user?.email },
          date: dayjs.utc().local().format(),
          notes: "",
          status: ITINERARY_STATUS.VOTING,
          votes: [],
          project_id: data?.[0]?.id,
        };
      }) || [];

    if (itinerariesToClone.length) {
      await supabaseClient
        .from("itineraries")
        .insert(itinerariesToClone)
        .select();
    }

    navigate("/projects");
  };

  return (
    <Box bg={COLORS.white} minHeight={"100vh"} p={6}>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Text
          as="b"
          fontSize={"2xl"}
        >{`Your viewing ${projectData?.title}`}</Text>
        {showCloneButton ? (
          <Button
            leftIcon={<IconPlaylistAdd />}
            color={COLORS.white}
            bg={COLORS.primaryColor}
            onClick={cloneProject}
          >
            Add to your stash
          </Button>
        ) : null}
      </Flex>

      <Flex
        justifyContent={"center"}
        my={12}
        flexDir={"column"}
        alignItems={"center"}
      >
        <Image width={250} src={TravelBagLogo} alt={"travel"} mb={6} />
        <Text as="b" fontSize={"2xl"}>
          Jump right into the adventure! This itinerary is good to go!
        </Text>

        <Flex
          alignItems={"center"}
          justifyContent={"space-around"}
          width="100%"
          mt={12}
        >
          <Flex alignItems={"center"} gap={4}>
            <Flex
              bg={COLORS.primary100}
              height={"80px"}
              width={"80px"}
              alignItems={"center"}
              justifyContent={"center"}
              borderRadius={"lg"}
            >
              <IconCalendarEvent color={COLORS.primary500} size={32} />
            </Flex>
            <Flex flexDir={"column"}>
              <Text as="b" textTransform={"uppercase"}>
                Travel dates
              </Text>
              <Text>
                {dayjs(projectData?.start_date).format("DD MMM 'YY")} -{" "}
                {dayjs(projectData?.end_date).format("DD MMM 'YY")}
              </Text>
            </Flex>
          </Flex>
          <Flex alignItems={"center"} gap={4}>
            <Flex
              bg={COLORS.primary100}
              height={"80px"}
              width={"80px"}
              alignItems={"center"}
              justifyContent={"center"}
              borderRadius={"lg"}
            >
              <IconCircles color={COLORS.primary500} size={32} />
            </Flex>
            <Flex flexDir={"column"}>
              <Text as="b" textTransform={"uppercase"}>
                Itinerary Items
              </Text>
              <Text>{itinerariesData?.length} confirmed</Text>
            </Flex>
          </Flex>
          <Flex alignItems={"center"} gap={4}>
            <Flex
              bg={COLORS.primary100}
              height={"80px"}
              width={"80px"}
              alignItems={"center"}
              justifyContent={"center"}
              borderRadius={"lg"}
            >
              <IconMapPin color={COLORS.primary500} size={32} />
            </Flex>
            <Flex flexDir={"column"}>
              <Text as="b" textTransform={"uppercase"}>
                destination
              </Text>
              <Text>{projectData?.destination}</Text>
            </Flex>
          </Flex>
          {projectData?.private && (
            <Flex alignItems={"center"} gap={4}>
              <Flex
                bg={COLORS.primary100}
                height={"80px"}
                width={"80px"}
                alignItems={"center"}
                justifyContent={"center"}
                borderRadius={"lg"}
              >
                <IconUsers color={COLORS.primary500} size={32} />
              </Flex>
              <Flex flexDir={"column"}>
                <Text as="b" textTransform={"uppercase"}>
                  people
                </Text>
                <Text>
                  {projectData?.collaborators &&
                    projectData?.collaborators?.length + 1}
                </Text>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
      {groupedData?.map((dayItinerary, i) => (
        <Box px={4} mt={4}>
          <Flex gap={3}>
            <Text fontSize={"2xl"} as="b">
              Day {i + 1} ({dayItinerary.length})
            </Text>
            <Text fontSize={"2xl"} as="b" color={COLORS.primary500}>
              Total: {sortedData?.length}
            </Text>
          </Flex>
          {dayItinerary?.map((itinerary) => (
            <Grid
              templateColumns={"1fr 1fr 1fr 1fr"}
              bg={COLORS.neutral200}
              p={8}
              my={8}
              borderRadius={"lg"}
            >
              <GridItem>
                <Text color={COLORS.neutral550}>Activity date</Text>
                <Text>{dayjs(itinerary.date).format("DD MMM YYYY")}</Text>
              </GridItem>
              <GridItem>
                <Text color={COLORS.neutral550}>Activity name</Text>
                <Text>{itinerary.title}</Text>
              </GridItem>
              <GridItem>
                <Text color={COLORS.neutral550}>Type</Text>
                <Text>{itinerary.type_of_activity}</Text>
              </GridItem>
              <GridItem>
                <Text color={COLORS.neutral550}>Location</Text>
                <Text>{itinerary.location}</Text>
              </GridItem>
            </Grid>
          ))}
        </Box>
      ))}
    </Box>
  );
};
