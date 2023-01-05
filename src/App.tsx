import React, { Suspense, useEffect, useState } from "react";

// react-router components
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Material Dashboard 2 React components
// Material Dashboard 2 React example components
import Sidenav from "components/customizes/Sidenav";

// Material Dashboard 2 React themes
import theme from "assets/theme";

// Material Dashboard 2 React routes
import { routes } from "routes";

// Material Dashboard 2 React contexts
import { setMiniSidenav, useMaterialUIController } from "context/materialContext";

// Images
// @ts-ignore
import avatarDefault from "assets/images/avatar_default.png";
import AlertSnackbar from "components/customizes/AlertSnackbar";
import { User } from "./models/base/user";
import { hasRole } from "./utils/checkRoles";
import { CHANGE_PASSWORD_ROUTE, MAIN_ROUTE, SIGN_IN_ROUTE } from "./constants/route";
import "./App.css";
import { signInSuccess, useAuthenController } from "./context/authenContext";
import Loading from "./components/customizes/Loading";
import LoadingPage from "./components/customizes/Loading/LoadingPage";
import ProviderStep from "./components/customizes/ScriptTour/ProviderStep";
import useIsMainWindow from "./utils/useIsMainWindow";
import { CircularProgress, Grid } from "@mui/material";
import Card from "@mui/material/Card";
import MDBox from "./components/bases/MDBox";
import MDTypography from "./components/bases/MDTypography";
import MDButton from "./components/bases/MDButton";
import { showSnackbar, useSnackbarController } from "./context/snackbarContext";
import { CHANGE_PASSWORD_SUCCESS, SUCCESS_TYPE } from "./constants/app";

export default function App() {
  // @ts-ignore
  const [controller, dispatch] = useMaterialUIController();
  // @ts-ignore
  const [authController, authDispatch] = useAuthenController();
  const { miniSidenav, direction, sidenavColor, layout } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const [currentUser, setCurrentUser] = useState<User>();
  const navigate = useNavigate();
  const isMain = useIsMainWindow();

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  // how to make me richer?
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    // @ts-ignore
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user === null && pathname === CHANGE_PASSWORD_ROUTE) {
      return;
    }
    if (user) {
      signInSuccess(authDispatch, JSON.parse(user));
      setCurrentUser(JSON.parse(user).user);
    } else {
      navigate(SIGN_IN_ROUTE);
    }
  }, []);

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();
  const getRoutes = (allRoutes: any[]): any =>
    allRoutes.map((route) => {
      // Prevent access to route that current user don't have role
      if (currentUser && route.roles && !hasRole(currentUser, route.roles)) {
        return null;
      }

      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const renderNotMainViewForm = () => (
    <Grid container justifyContent="center" alignItems="center" height="100vh">
      <Card style={{ width: "25%", background: "#3b4b54" }}>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDTypography variant="h6" fontWeight="medium" color="white">
              GSTTAN đang được mở ở một cửa sổ khác. Click &quot;Sử dụng ở đây&quot; để sử dụng trên
              cửa số này.
            </MDTypography>
            <MDBox mt={4} mb={1} display="flex">
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                onClick={() => {
                  // eslint-disable-next-line no-restricted-globals
                  location.reload();
                }}
              >
                Sử dụng ở đây
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </Grid>
  );

  useEffect(() => {
    if (localStorage.length === 0) {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(null, "", location.href);
      window.addEventListener("popstate", () => {
        // eslint-disable-next-line no-restricted-globals
        history.pushState(null, "", location.href);
      });
    }
  }, [localStorage.length]);

  useEffect(() => {
    if (localStorage.getItem("changePassword")) {
      showSnackbar(snackbarDispatch, {
        typeSnackbar: SUCCESS_TYPE,
        messageSnackbar: CHANGE_PASSWORD_SUCCESS,
      });
    }
    localStorage.removeItem("changePassword");
  }, []);

  return (
    <Suspense fallback={<LoadingPage />}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isMain ? (
          <>
            {layout === "dashboard" && (
              <Sidenav
                color={sidenavColor}
                brandName="Hệ thống GSTTAN"
                routes={routes}
                // @ts-ignore
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
            )}

            <AlertSnackbar />
            <Loading />
            <ProviderStep>
              <Routes>
                {getRoutes(routes)}
                <Route path="/" element={<Navigate to={MAIN_ROUTE} />} />;
                <Route path="*" element={<Navigate to={SIGN_IN_ROUTE} />} />;
              </Routes>
            </ProviderStep>
          </>
        ) : isMain === false ? (
          renderNotMainViewForm()
        ) : (
          <Grid container justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress style={{ color: "grey" }} />
          </Grid>
        )}
      </ThemeProvider>
    </Suspense>
  );
}
