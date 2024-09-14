import { useEffect, useState } from "react";
import {
  Text,
  Container,
  Circle,
  Stack,
  Flex,
  Box,
  Button,
} from "@chakra-ui/react";
import { CreateButton } from "@refinedev/chakra-ui";
import { useList, HttpError, useGetIdentity } from "@refinedev/core";

import { COLORS } from "../../utility/colors";
import { ExploreIcon } from "../../assets/explore-icon";
import { ProjectCard } from "../../components/project-card";
import { IUser } from "../../utility/interface";
import { useNavigate } from "react-router-dom";
import { IconPlus } from "@tabler/icons-react";

const ProjectEmptyState: React.FC = () => {
  return (
    <Container centerContent minHeight="80vh" justifyContent="center">
      <Text fontSize="5xl" color={COLORS.primaryColor} as="b">
        Welcome, #Username
      </Text>
      <Stack spacing={18} alignItems="center">
        <Circle size="64px" bg={COLORS.greyNeutral} color="black" mt={24}>
          <ExploreIcon />
        </Circle>
        <Text fontSize="4xl" as="b">
          Hey there, Explorer!
        </Text>
        <Text fontSize="xl" textAlign="center">
          Ready to kick-start your journey? Create your first travel project on
          TripStash!
        </Text>
      </Stack>
      <CreateButton bg={COLORS.primaryColor} mt={4} />
    </Container>
  );
};

export const Projects: React.FC = () => {
  const { data: user } = useGetIdentity<IUser>();
  const [personalStash, setPersonalStash] = useState<any[]>([]);
  const [collaboratorStash, setCollaboratorStash] = useState<any[]>([]);
  const navigate = useNavigate();
  const { data: projects } = useList<HttpError>({
    resource: "projects",
    pagination: {
      mode: "off",
    },
  });

  useEffect(() => {
    console.log("success 0");
    if (projects) {
      const _personalStash = projects?.data?.filter((project: any) => {
        if (project?.user_id === user?.id) {
          return project;
        }
      });

      const _collaboratorStash = projects?.data?.filter((project: any) => {
        console.log("Filtering project:", project.id);

        // Check if collaborators is an array and process each item
        if (Array.isArray(project?.collaborators)) {
          // Check if any collaborator matches the user id
          const isCollaborator = project.collaborators.some(
            (collaboratorStr: string) => {
              try {
                // Parse JSON string to an object
                const collaborator = JSON.parse(collaboratorStr);
                // Check if the collaborator's id matches the user id
                return collaborator?.id === user?.id;
              } catch (error) {
                console.error("Error parsing collaborator JSON:", error);
                return false; // Skip this collaborator if parsing fails
              }
            }
          );

          if (isCollaborator) {
            console.log("Project included:", project.id);
            return true;
          }
        }

        // Exclude this project if no collaborators match
        return false;
      });

      console.log("Filtered projects:", _collaboratorStash);

      setPersonalStash(_personalStash);
      setCollaboratorStash(_collaboratorStash);
    }
  }, [projects, user?.id]);

  const userHasProjects =
    personalStash?.length > 0 || collaboratorStash?.length > 0;

  return (
    <Box bg={COLORS.white} padding={4}>
      {userHasProjects ? (
        <div>
          <Flex
            flexDirection={{ base: "column", md: "row" }}
            justifyContent="space-between"
            gap={4}
            alignItems={{ base: "left", md: "center" }}
            mb={8}
          >
            <div>
              <Text fontSize="2xl" as="b">
                Your stash
              </Text>
              <Text fontSize="sm" color={COLORS.greyNeutral500}>
                View and manage all the projects created by you
              </Text>
            </div>
            <Button
              color={COLORS.white}
              onClick={() => navigate(`/projects/create`)}
              bg={COLORS.primaryColor}
              leftIcon={<IconPlus />}
            >
              Create new project
            </Button>
          </Flex>
          <Flex gap={8} flexDirection={"column"}>
            {personalStash.map((proj) => (
              <ProjectCard
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

          {collaboratorStash?.length ? (
            <>
              <Flex
                mt={16}
                justifyContent="space-between"
                alignItems="center"
                mb={8}
              >
                <div>
                  <Text fontSize="2xl" as="b">
                    Collaboration Stash
                  </Text>
                  <Text fontSize="sm" color={COLORS.greyNeutral500}>
                    View and manage all the projects you are collaborating on
                  </Text>
                </div>
              </Flex>
              <Flex gap={8} flexDirection={"column"}>
                {collaboratorStash.map((proj) => (
                  <ProjectCard
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
            </>
          ) : null}
        </div>
      ) : (
        <ProjectEmptyState />
      )}
    </Box>
  );
};
