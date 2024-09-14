import {
  Container,
  Box,
  Flex,
  Text,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  IconBriefcase,
  IconHome,
  IconHome2,
  IconSmartHome,
  IconLogout,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabaseClient } from "../../utility";
import { Logo } from "../../assets/logo";
import { COLORS } from "../../utility/colors";

export const CustomSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate("/");
  };

  const containerDisplay = useBreakpointValue({ base: "none", md: "block" });
  const iconDisplay = useBreakpointValue({ base: "flex", md: "none" });

  return (
    <Box>
      <Container
        display={containerDisplay}
        width={"13vw"}
        py={8}
        bg={COLORS.white}
        position={"fixed"}
        top={0}
        height={"100%"}
        zIndex={1}
      >
        <Box cursor={"pointer"} onClick={() => navigate("/")} mb={4}>
          <Flex alignItems={"center"}>
            <Logo />
            <div>
              <Text fontSize="lg" ml={4} as="b">
                TriPlan
              </Text>
            </div>
          </Flex>
        </Box>
        <Button
          variant={"ghost"}
          leftIcon={<IconSmartHome />}
          width={"full"}
          iconSpacing={"3"}
          size={"lg"}
          onClick={() => {
            navigate("/home");
          }}
          mt={2}
          fontSize={"sm"}
          isActive={location.pathname === "/home"}
        >
          <Text width={"90%"}>Home</Text>
        </Button>

        <Button
          variant={"ghost"}
          leftIcon={<IconBriefcase />}
          width={"full"}
          iconSpacing={"3"}
          size={"lg"}
          fontSize={"sm"}
          my={2}
          onClick={() => {
            navigate("/projects");
          }}
          isActive={location.pathname === "/projects"}
        >
          <Text width={"90%"}>Projects</Text>
        </Button>
        <Button
          variant={"ghost"}
          leftIcon={<IconLogout />}
          width={"full"}
          iconSpacing={"3"}
          size={"lg"}
          fontSize={"sm"}
          onClick={onLogout}
        >
          <Text width={"90%"}>Logout</Text>
        </Button>
      </Container>

      <Box
        display={iconDisplay}
        width={"10vw"}
        position={"fixed"}
        top={0}
        left={0}
        p={4}
        zIndex={2}
      >
        <Flex direction={"column"} alignItems={"center"} width="100%">
          <Box
            cursor={"pointer"}
            onClick={() => navigate("/")}
            mb={4}
            position={"fixed"}
          >
            <Flex
              justifyContent="center"
              alignItems={"center"}
              marginLeft={"4vw"}
            >
              <Logo />
            </Flex>
          </Box>

          <Button
            marginLeft={"4vw"}
            marginTop={"10vh"}
            variant={"ghost"}
            leftIcon={<IconSmartHome />}
            onClick={() => navigate("/home")}
            isActive={location.pathname === "/home"}
          />

          <Button
            marginLeft={"4vw"}
            marginTop={"5vh"}
            variant={"ghost"}
            leftIcon={<IconBriefcase />}
            onClick={() => navigate("/projects")}
            isActive={location.pathname === "/projects"}
          />

          <Button
            marginLeft={"4vw"}
            marginTop={"5vh"}
            variant={"ghost"}
            leftIcon={<IconLogout />}
            onClick={onLogout}
          />
        </Flex>
      </Box>
    </Box>
  );
};
