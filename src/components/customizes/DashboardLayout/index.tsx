import React, { useEffect, useState } from "react";

// react-router-dom components
import { useLocation, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/bases/MDBox";

// Material Dashboard 2 React context
import { setLayout, setOpenConfigurator, useMaterialUIController } from "context/materialContext";
import { signInSuccess, useAuthenController } from "context/authenContext";
import DashboardNavbar from "../DashboardNavbar";
import AudioActionButton from "layouts/base/dashboard/component/userAttendance/AudioActionButton";
import {
  addUserAttendanceItemSuccess,
  updateConfirmAudio,
  updateHasNotificationAudio,
  updateStatusAudio,
  updateToggleNotificationHistory,
  updateUserAttendanceItemSuccess,
  useNotificationHistoryController,
} from "context/notificationHistoryContext";
import Configurator from "layouts/base/dashboard/component/userAttendance/RequireAudioPermission";
import UserAttendance from "layouts/base/dashboard/component/userAttendance";

import { WEB_SOCKET_IN_OUT_URL, WEB_SOCKET_STREAM_URL } from "constants/api";
import ReconnectingWebSocket from "reconnecting-websocket";
import {
  isAreaRestrictionAdmin,
  isAreaRestrictionUser,
  isBehaviorAdmin,
  isBehaviorUser,
  isSuperAdmin,
  isSuperAdminOrganization,
  isTimeKeepingAdmin,
  isTimeKeepingUser,
} from "utils/checkRoles";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Fab } from "react-tiny-fab";
import { Maximize, Minimize } from "@mui/icons-material";
import FormUserAttendance from "layouts/base/dashboard/component/userAttendance/FormUserAttendance";
import { CAMERA_STREAM_LIST_LOCAL_STORAGE, RING_URL, USER_ATTENDANCE_TYPE } from "constants/app";
import { Modal } from "@mui/material";
import { SIGN_IN_ROUTE } from "constants/route";
import { useAudio } from "../../../layouts/base/dashboard/component/userAttendance/useAudio";
import { getAreaRestrictionNotificationCountApi } from "../../../layouts/base/dashboard/api";
import {
  addInOutHistorySuccess,
  useInOutHistoryController,
} from "../../../context/inOutHistoryContext";
import { getInOutHistoryByIdApi } from "../../../layouts/base/inOutHistory/api";

function DashboardLayout({
  children,
}: {
  children: Array<React.ReactElement> | React.ReactElement;
}) {
  // @ts-ignore
  const [controller, dispatch] = useMaterialUIController();
  // @ts-ignore
  const [authController, authDispatch] = useAuthenController();
  // @ts-ignore
  const [materialController, materialDispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();
  const [showAudioAction, setShowAudioAction] = useState(false);
  const [minizime, setMinizime] = useState(true);
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const locationPath = useLocation();
  const [ws, setWs] = useState<ReconnectingWebSocket | null>(null);
  const navigate = useNavigate();
  const [playing, play, pause] = useAudio(RING_URL);

  const [hasNotify, setHasNotify] = useState(false);

  // @ts-ignore
  const [notificationHistoryController, notificationHistoryDispatch] =
    useNotificationHistoryController();
  // @ts-ignore
  const [inOutHistoryController, inOutHistoryDispatch] = useInOutHistoryController();

  // For audio when has notification
  // @ts-ignore
  useEffect(async () => {
    let isMounted = true;
    if (
      authController.token &&
      (isAreaRestrictionUser(authController.currentUser) ||
        isBehaviorUser(authController.currentUser))
    ) {
      const getAreaRestrictionNotificationCountResponse =
        await getAreaRestrictionNotificationCountApi({ token: authController.token });
      if (getAreaRestrictionNotificationCountResponse.data !== null && isMounted) {
        updateHasNotificationAudio(
          notificationHistoryDispatch,
          getAreaRestrictionNotificationCountResponse.data.numberNotificationNotResolveUsingRing > 0
        );
      }
    }
    return () => {
      isMounted = false;
    };
  }, [authController.token, notificationHistoryController.toggle]);

  useEffect(() => {
    if (notificationHistoryController.hasNotificationAudio) {
      setHasNotify(true);
    } else {
      setHasNotify(false);
    }
  }, [notificationHistoryController.hasNotificationAudio]);

  // @ts-ignore
  useEffect(async () => {
    if (notificationHistoryController.isAudioOn && hasNotify && !playing) {
      // @ts-ignore
      await play();
    } else {
      // @ts-ignore
      await pause();
    }
  }, [notificationHistoryController.isAudioOn, hasNotify]);

  useEffect(
    // @ts-ignore
    () => async () => {
      // @ts-ignore
      await pause();
    },
    []
  );
  // End for audio

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, true);

  // useEffect(() => {
  //   setMiniSidenav(materialDispatch, window.innerWidth < 1200);
  // }, [materialController.miniSidenav]);

  useEffect(() => {
    if (
      notificationHistoryController.isConfirmAudio !== null &&
      notificationHistoryController.isConfirmAudio !== undefined
    ) {
      if (!notificationHistoryController.isConfirmAudio) {
        handleConfiguratorOpen();
      } else {
        setShowAudioAction(true);
      }
    }
  }, [notificationHistoryController.isConfirmAudio]);

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      signInSuccess(authDispatch, JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    let client: ReconnectingWebSocket | null = null;
    if (
      authController.currentUser &&
      (isAreaRestrictionUser(authController.currentUser) ||
        isBehaviorUser(authController.currentUser))
    ) {
      client = WEB_SOCKET_IN_OUT_URL
        ? new ReconnectingWebSocket(WEB_SOCKET_IN_OUT_URL, [], {
            WebSocket: W3CWebSocket,
            connectionTimeout: 1000,
            maxRetries: 100,
          })
        : null;

      const { location } = authController.currentUser;

      if (client) {
        setWs(client);
        client.onopen = () => {
          console.log("WebSocket Area Restriction Connected");
        };
        client.onmessage = async (message) => {
          if (typeof message.data === "string") {
            const jsonData: any = JSON.parse(message.data);
            switch (jsonData.socketType) {
              case "updateNotificationHistory":
                updateUserAttendanceItemSuccess(
                  notificationHistoryDispatch,
                  jsonData.notificationHistoryId
                );
                updateToggleNotificationHistory(notificationHistoryDispatch);
                break;
              case "arNotification":
                if (jsonData.locationId === location.id) {
                  addUserAttendanceItemSuccess(notificationHistoryDispatch, jsonData);
                  setMinizime(false);
                  updateToggleNotificationHistory(notificationHistoryDispatch);
                }
                break;
              case "arInOut":
                if (jsonData.locationId === location.id) {
                  const { inOutHistoryId } = jsonData;
                  const inOutHistoryResponse = await getInOutHistoryByIdApi({
                    token: authController.token,
                    inOutHistoryId,
                  });
                  if (inOutHistoryResponse.data) {
                    // @ts-ignore
                    addInOutHistorySuccess(inOutHistoryDispatch, inOutHistoryResponse.data);
                  }
                }
                break;
              default:
                console.log("Data Receive: ", jsonData);
            }
          }
        };
      }
    }

    return () => {
      if (client) {
        console.log("WebSocket Area Restriction Disconnect");
        client.close();
      }
    };
  }, [authController.token]);

  const addPeer = (peerId: string, meta: any) => {
    const streamList = localStorage.getItem(
      CAMERA_STREAM_LIST_LOCAL_STORAGE + localStorage.getItem("module")
    );
    let newStreamList: Array<{ peerId: string; camId: number }> = [];
    if (streamList) {
      newStreamList = JSON.parse(streamList);
      const requiredIndex = newStreamList.findIndex((el) => el.camId === meta["source-id"]);
      if (requiredIndex !== -1) {
        newStreamList.splice(requiredIndex, 1);
      }
    }
    newStreamList.push({
      peerId,
      camId: meta["source-id"],
    });
    localStorage.setItem(
      CAMERA_STREAM_LIST_LOCAL_STORAGE + localStorage.getItem("module"),
      JSON.stringify(newStreamList)
    );
  };

  useEffect(() => {
    let client: ReconnectingWebSocket | null = null;
    if (authController.currentUser) {
      client = WEB_SOCKET_STREAM_URL
        ? new ReconnectingWebSocket(WEB_SOCKET_STREAM_URL, [], {
            WebSocket: W3CWebSocket,
            connectionTimeout: 1000,
            maxRetries: 100,
          })
        : null;

      if (client) {
        client.onopen = () => {
          // @ts-ignore
          client.send(
            JSON.stringify({
              type: "setPeerStatus",
              roles: ["listener"],
            })
          );
        };

        client.onmessage = (event) => {
          console.log(`Received ${event.data}`);
          let msg = null;
          try {
            msg = JSON.parse(event.data);
          } catch (e) {
            console.error(`Error incoming JSON: ${event.data}`);
            return;
          }

          if (msg.type === "welcome") {
            console.info(`Got welcomed with ID ${msg.peer_id}`);
            // @ts-ignore
            client.send(
              JSON.stringify({
                type: "list",
              })
            );
          } else if (msg.type === "list") {
            for (let i = 0; i < msg.producers.length; i++) {
              addPeer(msg.producers[i].id, msg.producers[i].meta);
            }
          } else if (msg.type === "peerStatusChanged") {
            if (msg.roles.includes("producer")) {
              console.info("Adding peer");
              addPeer(msg.peerId, msg.meta);
            }
          } else {
            console.error("Unsupported message: ", msg);
          }
        };
      }
    }

    return () => {
      if (client) {
        console.log("WebSocket Area Restriction Disconnect");
        client.close();
      }
    };
  }, [authController.token]);

  const hasRoleToShowAudioConfirm = () => {
    if (authController.token) {
      if (isSuperAdmin(authController.currentUser)) {
        return false;
      }
      if (isSuperAdminOrganization(authController.currentUser)) {
        return false;
      }
      if (isTimeKeepingAdmin(authController.currentUser)) {
        return false;
      }
      if (isTimeKeepingUser(authController.currentUser)) {
        return false;
      }
      if (isAreaRestrictionAdmin(authController.currentUser)) {
        return false;
      }
      if (isAreaRestrictionUser(authController.currentUser)) {
        return true;
      }
      if (isBehaviorAdmin(authController.currentUser)) {
        return false;
      }
      if (isBehaviorUser(authController.currentUser)) {
        return true;
      }
    }
    return <div />;
  };

  const formUserAttendance = (closeForm: Function) => (
    <FormUserAttendance
      handleClose={closeForm}
      updateStatusNotificationHistory={updateStatusNotificationHistory}
    />
  );

  const handleViewUserAttendance = () => {
    setOpen(true);
    setActionType(USER_ATTENDANCE_TYPE);
  };

  useEffect(() => {
    if (notificationHistoryController.userAttendanceChoosed !== null) {
      handleViewUserAttendance();
    }
  }, [notificationHistoryController.userAttendanceChoosed]);

  const updateStatusNotificationHistory = (notificationHistoryId: number) => {
    updateUserAttendanceItemSuccess(notificationHistoryDispatch, notificationHistoryId);
    ws?.send(
      JSON.stringify({
        notificationHistoryId,
      })
    );
    updateToggleNotificationHistory(notificationHistoryDispatch);
  };

  // check time to line of local storage
  function getWithExpiry(key: any) {
    const itemStr = localStorage.getItem(key);

    // if the item doesn't exist, return null
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, delete the item from storage
      // and return null
      localStorage.clear();
      navigate(SIGN_IN_ROUTE);
      return null;
    }
    return item.value;
  }

  useEffect(() => {
    const expiry = setInterval(() => {
      getWithExpiry("timeToLine");
    }, 1000 * 60);
    return () => clearInterval(expiry);
  }, [localStorage.getItem("timeToLine")]);

  const showModalContent = () => {
    if (actionType === USER_ATTENDANCE_TYPE) return formUserAttendance(handleClose);
    return <div />;
  };

  return (
    <MDBox
      // @ts-ignore
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 3,
        position: "relative",
        [breakpoints.up("xl")]: {
          marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(["margin-left", "margin-right"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      <DashboardNavbar />
      {children}

      {showAudioAction && hasRoleToShowAudioConfirm() && <AudioActionButton />}

      {hasRoleToShowAudioConfirm() && (
        <Configurator
          handleConfirm={() => {
            setShowAudioAction(true);
            updateConfirmAudio(notificationHistoryDispatch, true);
            updateStatusAudio(notificationHistoryDispatch, true);
          }}
          handleReject={() => {
            setShowAudioAction(true);
            updateConfirmAudio(notificationHistoryDispatch, true);
            updateStatusAudio(notificationHistoryDispatch, false);
          }}
        />
      )}

      {hasRoleToShowAudioConfirm() && locationPath.pathname !== "/dashboard" && (
        <MDBox
          md={3}
          xl={5}
          lg={3}
          style={{
            width: "25%",
            position: "fixed",
            zIndex: 5,
            bottom: 0,
            right: "24px",
            background: "whitesmoke",
          }}
        >
          <Fab
            mainButtonStyles={{
              backgroundColor: "#e74c3c",
            }}
            style={{
              bottom: 0,
              right: 0,
            }}
            icon={minizime ? <Minimize /> : <Maximize />}
            event="click"
            key={0}
            alwaysShowTitle={false}
            onClick={() => {
              const newState = !minizime;
              setMinizime(newState);
            }}
            text={minizime ? "Hiện" : "Ẩn"}
          />
          {!minizime && <UserAttendance />}
        </MDBox>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>{showModalContent()}</>
      </Modal>
    </MDBox>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
