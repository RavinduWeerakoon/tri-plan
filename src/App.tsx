import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  notificationProvider,
  RefineThemes,
  ThemedLayoutV2,
  ThemedTitleV2,
} from "@refinedev/chakra-ui";
import { Box, ChakraProvider, extendTheme } from "@chakra-ui/react";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import authProvider from "./authProvider";
import { ProjectCreate, ProjectEdit, Projects } from "./pages/projects";
import { supabaseClient } from "./utility";
import { ForgotPassword, Login, Register, ResetPassword } from "./pages/auth";
import {
  ItineraryCreate,
  ItineraryEdit,
  ItineraryList,
  ItineraryShow,
} from "./pages/itineraries";
import { Landing } from "./pages/landing";
import { Invite } from "./pages/projects/invite";
import { Home } from "./pages/home";
import { CustomSidebar } from "./components/custom-sidebar/custom-sidebar";
import { ErrorPage } from "./pages/error-404/error";
import { FinalPlan } from "./pages/final-plan/final-plan";
import { Logo } from "./assets/logo";
import { useEffect } from "react";
import "@fontsource/catamaran/400.css";
import "@fontsource/catamaran/700.css";

function App() {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    document.title = "Triplan";
  }, []);

  useEffect(() => {
    localStorage.setItem("chakra-ui-color-mode", "light");
  }, []);

  const customTheme = extendTheme({
    ...RefineThemes.Magenta,
    config: {
      initialColorMode: "light",
      useSystemColorMode: false,
    },
    fonts: {
      heading: `'Catamaran', sans-serif`,
      body: `'Catamaran', sans-serif`,
    },
  });

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, String(params)),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ChakraProvider theme={customTheme}>
          <Refine
            dataProvider={dataProvider(supabaseClient)}
            liveProvider={liveProvider(supabaseClient)}
            authProvider={authProvider}
            routerProvider={routerBindings}
            notificationProvider={notificationProvider}
            i18nProvider={i18nProvider}
            resources={[
              {
                name: "projects",
                list: "/projects",
                create: "/projects/create",
                edit: "/projects/edit/:id",
                meta: {
                  canDelete: true,
                },
              },
              {
                name: "itineraries",
                list: "/:projectId/itinerary",
                create: "/:projectId/itinerary/create",
                edit: "/:projectId/itinerary/edit/:id",
                show: "/:projectId/itinerary/show/:id",
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route index path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/update-password" element={<ResetPassword />} />
              <Route
                element={
                  <ThemedLayoutV2
                    Header={() => <></>}
                    Title={({ collapsed }) => (
                      <ThemedTitleV2
                        collapsed={collapsed}
                        text="TriPlan"
                        icon={<Logo />}
                      />
                    )}
                    Sider={() => <CustomSidebar />}
                  >
                    <Box
                      ml={{ base: "10vw", md: "13vw" }}
                      width={{ base: "88vw", md: "83vw" }}
                      alignItems={"center"}
                    >
                      <Outlet />
                    </Box>
                  </ThemedLayoutV2>
                }
              >
                <Route
                  path="/home"
                  element={
                    <Authenticated
                      key="authenticated"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Home />
                    </Authenticated>
                  }
                />
                <Route path="/projects">
                  <Route
                    index
                    element={
                      <Authenticated
                        key="authenticated"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <Projects />
                      </Authenticated>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <Authenticated
                        key="authenticated"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ProjectCreate />
                      </Authenticated>
                    }
                  />
                  <Route
                    path="edit/:id"
                    element={
                      <Authenticated
                        key="authenticated"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ProjectEdit />
                      </Authenticated>
                    }
                  />
                  <Route
                    path="invite/:userId/:projectId"
                    element={
                      <Authenticated
                        key="authenticated"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <Invite />
                      </Authenticated>
                    }
                  />
                </Route>
                <Route path="/:projectId/itinerary">
                  <Route
                    index
                    element={
                      <Authenticated
                        key="authenticated"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ItineraryList />
                      </Authenticated>
                    }
                  />
                  <Route
                    path="create"
                    element={
                      <Authenticated
                        key="authenticated"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ItineraryCreate />
                      </Authenticated>
                    }
                  />
                  <Route
                    path="edit/:id"
                    element={
                      <Authenticated
                        key="authenticated"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ItineraryEdit />
                      </Authenticated>
                    }
                  />
                  <Route
                    path="show/:id"
                    element={
                      <Authenticated
                        key="authenticated"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ItineraryShow />
                      </Authenticated>
                    }
                  />
                </Route>
                <Route path="/final-plan/:projectId" element={<FinalPlan />} />

                <Route path="*" element={<ErrorPage />} />
              </Route>
            </Routes>

            <RefineKbar />
            <DocumentTitleHandler />
          </Refine>
        </ChakraProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
