import React, { useEffect, useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  useParsed,
  HttpError,
  useTable,
  useUpdate,
  useGetIdentity,
  useMany,
  useList,
} from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import {
  List,
  DateField,
  EditButton,
  DeleteButton,
  ShowButton,
} from "@refinedev/chakra-ui";
import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Select,
  Text,
  Tabs,
  Tab,
  TabPanels,
  TabList,
  TabPanel,
  Flex,
  Tag,
  Heading,
  Button,
  TagLabel,
  Box,
  Icon,
} from "@chakra-ui/react";
import { COLORS } from "../../utility/colors";
import { IItinerary, IProject, IUser } from "../../utility/interface";
import {
  IconHeart,
  IconLocation,
  IconMessage2,
  IconPlus,
} from "@tabler/icons-react";
import InviteModal from "../../components/invite-modal";
import { ITINERARY_STATUS } from "../../utility/constants";
import Chat from "../../components/chat/chat";
import dayjs from "dayjs";
import { getActivityColor, supabaseClient } from "../../utility";
import DropBox from "../../components/dropbox";
import AddBillManually from "./AddExpenseModal";
import PhotoGallery from "../../components/photo-gallery/PhotoGallery";
import { Center } from '@chakra-ui/react'

export const ItineraryList: React.FC<IResourceComponentsProps> = () => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chats, setChats] = useState<any>([]);
  const [bills, setbills] = useState<any>([]);
  const [activeTab, setActiveTab] = useState("All Items");
  const [dropbox, setdropbox] = useState(false);

  const { mutate } = useUpdate<HttpError>();
  const params = useParams();
  const navigate = useNavigate();
  const { data: user } = useGetIdentity<IUser>();
  const { tableQueryResult, setFilters, filters } = useTable<
    IItinerary,
    HttpError
  >({
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

  const [ids] = useState([params?.projectId]);

  const { data: billData } = useList<HttpError>({
    resource: "bills",
    pagination: {
      mode: "off",
    },
  });

  useEffect(() => {
    if (billData) {
      const _bills = billData?.data?.filter((bill: any) => {
        if (bill?.project_id === Number(params?.projectId)) {
          return bill;
        }
      });
      setbills(_bills);
    }
  }, [billData, params?.projectId]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const { data: projectData } = useMany<IProject, HttpError>({
    resource: "projects",
    ids,
  });

  const activeConfirmedTab = useMemo(() => {
    return filters
      .filter((filter: any) => filter.field === "status")
      .filter((fil: any) => fil.value === ITINERARY_STATUS.CONFIRMED);
  }, [filters]);

  const projectItineraries = tableQueryResult?.data?.data ?? [];

  const sortedProjectItineraries = projectItineraries?.sort(
    (a: IItinerary, b: IItinerary) => {
      const date1 = new Date(a.date);
      const date2 = new Date(b.date);
      return date1.getTime() - date2.getTime();
    }
  );

  const handleLikes = (data: any) => {
    let votes = data.votes || [];
    const userVoteFound = votes?.some(
      (vote: { id: string | undefined }) => vote.id === user?.id
    );
    if (userVoteFound) {
      votes = votes.filter((vote: { id: any }) => vote.id !== user?.id);
    } else {
      votes.push({
        id: user?.id,
        email: user?.email,
      });
    }
    mutate({
      resource: "itineraries",
      values: {
        votes: votes,
      },
      id: data.id,
    });
  };
  const handleStatusChange = (data: any, updatedStatus: string) => {
    if (updatedStatus) {
      mutate({
        resource: "itineraries",
        values: {
          status: updatedStatus,
        },
        id: data.id,
      });
    }
  };

  const getInviteUrl = () => {
    return `${window.location.origin}/projects/invite/${user?.id}/${params?.projectId}`;
  };

  const showdropbox = () => {
    setdropbox(!dropbox);
  };
  
  return (
    <List
      title={<Heading size="lg">{projectData?.data?.[0]?.title}</Heading>}
      canCreate={false}
      headerButtons={() => (
        <>
          <Button
            colorScheme="pink"
            leftIcon={<IconPlus />}
            variant={"outline"}
            onClick={() => {
              setInviteOpen(true);
            }}
          >
            Invite
          </Button>
          <Button
            bg={COLORS.primaryColor}
            leftIcon={<IconPlus />}
            onClick={() => navigate(`/${params?.projectId}/itinerary/create`)}
            color={COLORS.white}
          >
            Add itinerary item
          </Button>
          {activeTab === "Confirmed" && activeConfirmedTab.length > 0 && (
            <Button
              leftIcon={<IconLocation />}
              colorScheme="pink"
              variant={"outline"}
              onClick={() => navigate(`/final-plan/${params?.projectId}`)}
            >
              View Final Plan
            </Button>
          )}
          {activeTab === "Bills" && (
            <Button
              bg={COLORS.primaryColor}
              leftIcon={<Icon as={IconPlus} />}
              onClick={handleOpenModal}
              color={COLORS.white}
            >
              Add Expense
            </Button>
          )}
          <AddBillManually
            projectId={params?.projectId}
            added_User={{ id: params?.id, email: params?.email }}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </>
      )}
    >
      <Tabs
        variant="soft-rounded"
        mt={8}
        colorScheme="pink"
        minHeight={"80vh"}
        isFitted // Ensure the tabs fit within the parent
      >
        <TabList
          flexWrap={{ base: "wrap", md: "nowrap" }} // Wrap the tabs on smaller screens
        >
          <Tab
            color={COLORS.primaryColor}
            onClick={() => {
              setActiveTab("All Items");
              setFilters([]);
              navigate(`/${params?.projectId}/itinerary`);
            }}
            fontSize={{ base: "sm", md: "md" }} // Responsive font size
            p={{ base: 2, md: 4 }} // Responsive padding
            whiteSpace="normal" // Allow text to wrap
          >
            All Items
          </Tab>
          <Tab
            color={COLORS.primaryColor}
            onClick={() => {
              setActiveTab("Confirmed");
              setFilters([
                {
                  field: "status",
                  operator: "eq",
                  value: ITINERARY_STATUS.CONFIRMED,
                },
              ]);
            }}
            fontSize={{ base: "sm", md: "md" }} // Responsive font size
            p={{ base: 2, md: 4 }} // Responsive padding
            whiteSpace="normal" // Allow text to wrap
          >
            Confirmed
          </Tab>
          <Tab
            color={COLORS.primaryColor}
            onClick={() => {
              setActiveTab("Canceled");
              setFilters([
                {
                  field: "status",
                  operator: "eq",
                  value: ITINERARY_STATUS.CANCELED,
                },
              ]);
            }}
            fontSize={{ base: "sm", md: "md" }} // Responsive font size
            p={{ base: 2, md: 4 }} // Responsive padding
            whiteSpace="normal" // Allow text to wrap
          >
            Canceled
          </Tab>
          <Tab
            color={COLORS.primaryColor}
            onClick={() => setActiveTab("Bills")}
            fontSize={{ base: "sm", md: "md" }} // Responsive font size
            p={{ base: 2, md: 4 }}
            whiteSpace="normal"
          >
            Expenses
          </Tab>
          <Tab
            color={COLORS.primaryColor}
            onClick={() => {setActiveTab('imageGallery');}}>
            Image Gallery
          </Tab>
        </TabList>

        <TabPanels overflowX={"auto"}>
          <ItineraryTabPanel
            list={sortedProjectItineraries}
            handleLikes={handleLikes}
            handleStatusChange={handleStatusChange}
            userId={user?.id}
          />
          <ItineraryTabPanel
            list={sortedProjectItineraries}
            handleLikes={handleLikes}
            handleStatusChange={handleStatusChange}
            userId={user?.id}
          />
          <ItineraryTabPanel
            list={sortedProjectItineraries}
            handleLikes={handleLikes}
            handleStatusChange={handleStatusChange}
            userId={user?.id}
          />
          <BillTabPanel list={bills} userId={user?.id} />
          <TabPanel>
            {activeTab === 'imageGallery' && (
              <div>
                {/* Your image gallery component or code here */}
                <Center h='100px' color='black'>
                  <Text as='b' fontSize='40px' color='black'>Image Gallery</Text>
                </Center>
                <PhotoGallery />
                
              </div>
            )}
        </TabPanel>
        </TabPanels>
      </Tabs>
      <InviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        url={getInviteUrl()}
      />

      <Chat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        projectId={params?.projectId}
        chats={chats}
        setChats={setChats}
      />

      <Tag
        color={COLORS.white}
        background={COLORS.primaryColor}
        position={"fixed"}
        bottom={8}
        right={8}
        cursor={"pointer"}
        fontSize={"lg"}
        borderRadius={"xl"}
        onClick={() => setChatOpen(true)}
        padding={4}
      >
        <IconMessage2 />
        <TagLabel ml={2}>Chat {chats?.length ? chats?.length : null}</TagLabel>
      </Tag>
    </List>
  );
};

const BillTabPanel = ({ list, userId }: { list: any; userId: any }) => {
  const navigate = useNavigate();

  const handleBillEdit = (id: any) => {
    console.log("id", id);
    navigate(`/bills/edit/${id}`);
  };

  let total = 0;
  list.forEach((bill: any) => {
    total += bill.price;
  });

  const [collaboratorCount, setCollaboratorCount] = useState<number>(3);

  const fetchProjectById = async () => {
    const { data, error } = await supabaseClient
      .from("projects")
      .select("collaborators") // Only select the 'collaborators' column
      .eq("id", params?.projectId);

    if (error) {
      console.error("Error fetching project:", error);
      return null;
    }

    if (data && data.length > 0) {
      const collaborators = data[0].collaborators; // Assuming the first record is the desired one
      const collaboratorsCount = collaborators ? collaborators.length : 0; // Check if collaborators exist and get the length
      console.log("Number of collaborators:", collaboratorsCount);
      return collaboratorsCount;
    }

    return 0;
  };
  useEffect(() => {
    const fetchCollaboratorCount = async () => {
      const count = await fetchProjectById();
      setCollaboratorCount(count || 1);
    };

    fetchCollaboratorCount();
  }, []);

  return (
    <TabPanel padding={"unset"} pt={4} width={"100%"}>
      <TableContainer
        whiteSpace="pre-line"
        overflowX={{ base: "scroll", sm: "auto" }}
      >
        <Table variant="simple">
          <Thead bg={COLORS.lightGrey}>
            <Tr>
              <Th>Date</Th>
              <Th>Time</Th>
              <Th>Description</Th>
              <Th>Price</Th>
              <Th>Items</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {list.map((bill: any) => (
              <Tr key={bill.id}>
                <Td>
                  <Text fontSize={"sm"}>
                    {dayjs(bill.date).format("DD-MMM-YYYY")}
                  </Text>
                </Td>
                <Td>
                  <Text>{bill.time}</Text>
                </Td>
                <Td>
                  <Text as="b">{bill.description}</Text>
                </Td>
                <Td>
                  <Text>{bill.price.toFixed(2)}</Text>
                </Td>
                <Td>
                  <Box>
                    {Object.entries(bill.items).map(
                      ([item, count]: [string, unknown]) => (
                        <Text key={item}>{`${item}`}</Text>
                      )
                    )}
                  </Box>
                </Td>
                {userId === bill.added_user.id ? (
                  <Td>
                    <Flex gap={2}>
                      <EditButton
                        recordItemId={bill.id}
                        hideText
                        onClick={() => {
                          handleBillEdit(bill.id);
                        }}
                      />
                      <DeleteButton recordItemId={bill.id} hideText />
                    </Flex>
                  </Td>
                ) : (
                  <Td>
                    <ShowButton recordItemId={bill.id} hideText />
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {/* Total expense section */}
      <Text mt={4} fontSize="lg" fontWeight="bold" color="teal.500">
        Total expense for a person is:{" "}
        {(total / Number(collaboratorCount)).toFixed(2)}
      </Text>
    </TabPanel>
  );
};

const ItineraryTabPanel = ({
  list,
  handleLikes,
  handleStatusChange,
  userId,
}: {
  list: any;
  handleLikes: (data: any) => void;
  handleStatusChange: (data: any, status: string) => void;
  userId?: any;
}) => {
  return (
    <TabPanel padding={"unset"} pt={4} width={"100%"}>
      <TableContainer
        whiteSpace="pre-line"
        overflowX={{ base: "scroll", sm: "auto" }}
      >
        <Table variant="simple">
          <Thead bg={COLORS.lightGrey}>
            <Tr>
              <Th>Date</Th>
              <Th>Name</Th>
              <Th>Location</Th>
              <Th>Type</Th>
              <Th>Votes</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {list.map((row: IItinerary) => (
              <Tr key={row.id}>
                <Td>
                  <Text fontSize={"sm"}>
                    {dayjs(row.date).format("DD-MMM-YYYY")}{" "}
                  </Text>
                </Td>
                <Td>
                  <Text as="b">{row.title}</Text>
                </Td>
                <Td>
                  <Text color={COLORS.greyNeutral500}>{row.location}</Text>
                </Td>
                <Td>
                  <Tag
                    colorScheme={getActivityColor(row.type_of_activity)}
                    borderRadius={"full"}
                    whiteSpace={"nowrap"}
                  >
                    {row.type_of_activity}
                  </Tag>
                </Td>
                <Td>
                  <Flex
                    cursor={"pointer"}
                    onClick={() => handleLikes(row)}
                    gap={2}
                  >
                    <IconHeart
                      color={
                        row?.votes?.some((vote: any) => vote?.id === userId)
                          ? "red"
                          : "black"
                      }
                    />
                    <Text>{row.votes?.length}</Text>
                  </Flex>
                </Td>
                <Td>
                  <Select
                    placeholder="Select option"
                    defaultValue={row.status}
                    disabled={userId !== row.added_by.id}
                    onChange={(e) => handleStatusChange(row, e.target.value)}
                  >
                    <option value={ITINERARY_STATUS.VOTING}>
                      {ITINERARY_STATUS.VOTING}
                    </option>
                    <option value={ITINERARY_STATUS.CONFIRMED}>
                      {ITINERARY_STATUS.CONFIRMED}
                    </option>
                    <option value={ITINERARY_STATUS.CANCELED}>
                      {ITINERARY_STATUS.CANCELED}
                    </option>
                  </Select>
                </Td>
                {userId === row.added_by.id ? (
                  <Td>
                    <Flex gap={2}>
                      <EditButton recordItemId={row.id} hideText />
                      <DeleteButton recordItemId={row.id} hideText />
                    </Flex>
                  </Td>
                ) : (
                  <Td>
                    <ShowButton recordItemId={row.id} hideText />
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </TabPanel>
  );
};
