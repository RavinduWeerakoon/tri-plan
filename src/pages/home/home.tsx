import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Spacer,
  Text,
  ChakraProvider,
} from "@chakra-ui/react";
import { IUser } from "../../utility/interface";
import { IconPlus } from "@tabler/icons-react";
import { COLORS } from "../../utility/colors";
import { useEffect, useState } from "react";
import {
  useList,
  HttpError,
  useGetIdentity,
  useNavigation,
  useParsed,
} from "@refinedev/core";
import { ProjectCard } from "../../components/project-card";
import PublicCard from "../../components/public-card";
import PublicProjectModal from "../../components/public-project-modal";
import { useNavigate } from "react-router-dom";
import Chatbot from "../../components/Ai_chat/Chatbot";

export function Home() {
  const { push } = useNavigation();
  const { data: user } = useGetIdentity<IUser>();
  const [personalStash, setPersonalStash] = useState<any[]>([]);
  const [publicStash, setPublicStash] = useState<any[]>([]);
  const navigate = useNavigate();

  const { data: projects, error: projectError } = useList<HttpError>({
    resource: "projects",
    pagination: {
      mode: "off",
    },
  });

  useEffect(() => {
    if (projects) {
      const _personalStash = projects?.data?.filter(
        (project: any) => project?.user_id === user?.id
      );
      const _publicStash = projects?.data?.filter(
        (project: any) => project?.user_id !== user?.id && !project.private
      );
      setPersonalStash(_personalStash);
      setPublicStash(_publicStash);
    }
  }, [projects, user?.id]);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <Box bg={COLORS.white} padding={4}>
      <div>
        <Heading as="h4" size="md" py={6}>
          Welcome back, {user?.email}
        </Heading>
        <Flex gap="4" flexDirection={{ base: "column", md: "row" }}>
          <Flex gap={4}>
            <Card height="180px">
              <CardHeader>
                <Text fontSize={"lg"} color={COLORS.greyNeutral500} as="b">
                  Your active projects
                </Text>
              </CardHeader>
              <CardBody>
                <Text fontSize={"4xl"} as="b">
                  {personalStash?.length || 0}
                </Text>
              </CardBody>
            </Card>

            <Card
              backgroundColor={COLORS.primaryColor}
              color={"white"}
              height="180px"
              alignItems={"center"}
              justifyContent={"center"}
              padding={4}
              flexWrap={"nowrap"}
              flexDirection={"row"}
              cursor={"pointer"}
              fontSize={"lg"}
              onClick={() => push("/projects/create")}
            >
              <IconPlus />
              Create a new project
            </Card>
          </Flex>
          <ChakraProvider>
            <Chatbot />
          </ChakraProvider>
        </Flex>
      </div>
      <Spacer height={14} />

      <div>
        <Flex flexDirection={"column"}>
          <Text fontSize="2xl" mb="4" as="b">
            Your Stash
          </Text>
          <Text fontSize="sm" mb="4" as="b" color={COLORS.greyNeutral500}>
            View and manage all the projects you are a part of here
          </Text>
        </Flex>
        <Flex gap={8} flexDirection={"column"}>
          {personalStash.map((proj: any) => (
            <ProjectCard
              key={proj.id}
              title={proj.title}
              start_date={proj.start_date}
              end_date={proj.end_date}
              destination={proj.destination}
              description={proj.description}
              id={proj.id}
              status={proj.status}
              user_id={proj.user_id}
              is_private={proj.private}
              collaborators={proj.collaborators}
              {...proj}
            />
          ))}
        </Flex>
      </div>

      <div>
        <Flex mt={12} flexDirection={"column"}>
          <Text fontSize="2xl" mb="4" as="b">
            Public Stash
          </Text>
          <Text fontSize="sm" as="b" color={COLORS.greyNeutral500}>
            See what other people are working on
          </Text>
        </Flex>
        <Flex gap={4} alignItems={"center"} flexWrap={"wrap"}>
          {publicStash.map((proj: any) => (
            <PublicCard
              key={proj.id}
              title={proj.title}
              status={proj?.status}
              image={proj?.image_link}
              onClick={() => navigate(`/final-plan/${proj.id}`)}
            />
          ))}
        </Flex>
      </div>
    </Box>
  );
}
