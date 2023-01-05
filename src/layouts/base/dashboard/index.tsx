import React, { useCallback, useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/bases/MDBox";
import DashboardLayout from "components/customizes/DashboardLayout";
import { Button, Icon, Modal } from "@mui/material";
import FormCamera from "./component/cameraList/CameraListView";
import { Camera } from "models/base/camera";
import {
  CAMERA_ORDER_CONFIG_LOCAL_STORAGE,
  CAMERA_STARTED_LOCAL_STORAGE,
  NUMBER_CAMERA_SHOW_DEFAULT,
  VIEW_TYPE,
} from "constants/app";
import {
  isAreaRestrictionAdmin,
  isAreaRestrictionUser,
  isBehaviorAdmin,
  isBehaviorUser,
  isSuperAdmin,
  isSuperAdminOrganization,
  isTimeKeepingAdmin,
  isTimeKeepingUser,
} from "../../../utils/checkRoles";
import SuperAdminDashboardItemList from "./component/itemList/SuperAdminDashboardItemList";
import CameraViewItem from "./component/cameraList/CameraViewItem";
import SuperAdminOrganizationDashboardItemList from "./component/itemList/SuperAdminOrganizationDashboardItemList";
import TimeKeepingAdminDashboardItemList from "./component/itemList/TimeKeepingAdminDashboardItemList";
import TimeKeepingUserDashboardItemList from "./component/itemList/TimeKeepingUserDashboardItemList";

import UserAttendance from "./component/userAttendance";
import AreaRestrictionAdminDashboardItemList from "./component/itemList/AreaRestrictionAdminDashboardItemList";
import AreaRestrictionUserDashboardItemList from "./component/itemList/AreaRestrictionUserDashboardItemList";
import { useAuthenController } from "../../../context/authenContext";
import { getAllCameraApi } from "../camera/api";
import BehaviorAdminDashboardItemList from "./component/itemList/BehaviorAdminDashboardItemList";
import BehaviorUserDashboardItemList from "./component/itemList/BehaviorUserDashboardItemList";
import FirstModal from "../../../components/customizes/ScriptTour/FirstModal";
// @ts-ignore
import { useTour } from "@reactour/tour";
import SuperAdmin from "../../../components/customizes/ScriptTour/ListScript/Dashboard/SuperAdmin";
import SuperAdminOrganization from "../../../components/customizes/ScriptTour/ListScript/Dashboard/SuperAdminOrganization";
import TimeKeepingAdmin from "../../../components/customizes/ScriptTour/ListScript/Dashboard/TimeKeepingAdmin";
import TimeKeepingUser from "../../../components/customizes/ScriptTour/ListScript/Dashboard/TimeKeepingUser";
import AreaRestrictionAdmin from "../../../components/customizes/ScriptTour/ListScript/Dashboard/AreaRestrictionAdmin";
import AreaRestrictionUser from "../../../components/customizes/ScriptTour/ListScript/Dashboard/AreaRestrictionUser";
import BehaviorAdmin from "../../../components/customizes/ScriptTour/ListScript/Dashboard/BehaviorAdmin";
import BehaviorUser from "../../../components/customizes/ScriptTour/ListScript/Dashboard/BehaviorUser";
import JumpCondition from "../../../components/customizes/ScriptTour/JumpCondition";
import StepsForRule from "../../../components/customizes/ScriptTour/StepsForRule";
import { Getter } from "../../../components/customizes/ScriptTour/StateTour/Getter";
import { Setter } from "../../../components/customizes/ScriptTour/StateTour/Setter";

function Dashboard(): React.ReactElement {
  // @ts-ignore
  const [authController, authDispatch] = useAuthenController();
  const [actionType, setActionType] = useState("");
  const [cameraList, setCameraList] = useState<Array<Camera | null>>([]);
  const [isShowCameraList, setIsShowCameraList] = useState(false);
  const [isHasRightComponent, setIsHasRightComponent] = useState(false);
  const [token, setToken] = useState(null);
  const [open, setOpen] = useState(false);
  const { currentStep, setCurrentStep, setSteps, isOpen } = useTour();
  const listItemChecked: Array<any> = [];
  const [temp, setTemp] = useState(false);
  const [seed, setSeed] = useState(1);

  const handleClose = () => {
    setOpen(false);
  };

  const handleView = () => {
    setOpen(true);
    setActionType(VIEW_TYPE);
  };

  const refreshPage = (hours: any, minutes: any) => {
    const now = new Date();
    if (now.getHours() === hours && now.getMinutes() === minutes) {
      setSeed(Math.random());
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTemp(true);
    } else {
      setTemp(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (Getter()?.STATUS_DASHBOARD === true && !isOpen) {
      Setter(!temp, Getter()?.STATUS_CAMERA, Getter()?.STATUS_IN_OUT_HISTORY);
    }
  }, [temp, isOpen]);

  useEffect(() => {
    setToken(authController.token);
  }, [authController.token]);

  useEffect(() => {
    if (token) {
      if (
        isTimeKeepingAdmin(authController.currentUser) ||
        isTimeKeepingUser(authController.currentUser) ||
        isAreaRestrictionAdmin(authController.currentUser) ||
        isAreaRestrictionUser(authController.currentUser) ||
        isBehaviorAdmin(authController.currentUser) ||
        isBehaviorUser(authController.currentUser)
      ) {
        setIsShowCameraList(true);
      }
      setIsHasRightComponent(
        isAreaRestrictionUser(authController.currentUser) ||
          isBehaviorUser(authController.currentUser)
      );
      setStepAndRule();
    }
  }, [token]);

  // @ts-ignore
  useEffect(async () => {
    const listCamera = localStorage.getItem(
      CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module")
    );
    if (listCamera !== null && token) {
      const listCameraArray = JSON.parse(listCamera);
      let result: Array<Camera | null> = [];
      const cameraIds = listCameraArray.map((item: any) => item.camera);
      if (cameraIds.length > 0) {
        const getAllCameraByCameraIdsResponse = await getAllCameraApi({
          token,
          page: 0,
          size: cameraIds.length,
          cameraIds,
          status: "active",
        });
        if (getAllCameraByCameraIdsResponse.data != null) {
          const cameras = getAllCameraByCameraIdsResponse.data.data;
          result = cameraIds.map((item: number) => {
            const tmps = cameras.filter((element: Camera) => element.id === item);
            if (tmps.length > 0) {
              return tmps[0];
            }
            return null;
          });
        }
        setCameraList(result);
      } else {
        setCameraList([]);
      }
    }
  }, [
    localStorage.getItem(CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module")),
    token,
  ]);

  const fetchData = useCallback(
    async ({ page, size, search }) => {
      if (token) {
        const getAllCameraResponse = await getAllCameraApi({
          token,
          page,
          size: Number(NUMBER_CAMERA_SHOW_DEFAULT),
          search,
          status: "active",
        });
        if (getAllCameraResponse.data !== null) {
          setCameraList(() => getAllCameraResponse.data.data.map((camera: any) => camera));

          const newCameraStartedArray: Array<number> = getAllCameraResponse.data.data.map(
            (camera: any) => camera.id
          );
          getAllCameraResponse.data.data.map((camera: any) =>
            listItemChecked.push({
              camera: camera.id,
              orderIndex: 1,
            })
          );

          if (newCameraStartedArray.length === 0) {
            localStorage.removeItem(CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module"));
          } else {
            localStorage.setItem(
              CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module"),
              JSON.stringify(newCameraStartedArray)
            );
          }
        }
        localStorage.setItem(
          CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module"),
          JSON.stringify(listItemChecked)
        );
      }
    },
    [token]
  );

  // set default camera
  useEffect(() => {
    const cameraOrderConfigLocal = localStorage.getItem(
      CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module")
    );
    const cameraStatedConfigLocal = localStorage.getItem(
      CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module")
    );
    if (cameraOrderConfigLocal === null && cameraStatedConfigLocal === null) {
      fetchData({ page: 0, size: 10 }).catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshPage(0, 0);
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const combineJumpCondition = () => {
    const currStep = currentStep;
    const STEP_START_CASE_1 = 3;
    const STEP_END_CASE_1 = 8;
    const STEP_START_CASE_2 = 7;
    const STEP_END_CASE_2 = 2;
    JumpCondition(currStep, STEP_START_CASE_1, open, STEP_END_CASE_1, setCurrentStep);
    JumpCondition(currStep, STEP_START_CASE_2, open, STEP_END_CASE_2, setCurrentStep);
  };

  useEffect(() => {
    if (authController.token) {
      if (isTimeKeepingAdmin(authController.currentUser)) {
        combineJumpCondition();
      }
      if (isTimeKeepingUser(authController.currentUser)) {
        combineJumpCondition();
      }
      if (isAreaRestrictionAdmin(authController.currentUser)) {
        combineJumpCondition();
      }
      if (isAreaRestrictionUser(authController.currentUser)) {
        combineJumpCondition();
      }
      if (isBehaviorAdmin(authController.currentUser)) {
        combineJumpCondition();
      }
      if (isBehaviorUser(authController.currentUser)) {
        combineJumpCondition();
      }
    }
  }, [currentStep]);

  const renderDashboardItems = () => {
    if (authController.token) {
      if (isSuperAdmin(authController.currentUser)) {
        return <SuperAdminDashboardItemList />;
      }
      if (isSuperAdminOrganization(authController.currentUser)) {
        return <SuperAdminOrganizationDashboardItemList />;
      }
      if (isTimeKeepingAdmin(authController.currentUser)) {
        return <TimeKeepingAdminDashboardItemList />;
      }
      if (isTimeKeepingUser(authController.currentUser)) {
        return <TimeKeepingUserDashboardItemList />;
      }
      if (isAreaRestrictionAdmin(authController.currentUser)) {
        return <AreaRestrictionAdminDashboardItemList />;
      }
      if (isAreaRestrictionUser(authController.currentUser)) {
        return <AreaRestrictionUserDashboardItemList />;
      }
      if (isBehaviorAdmin(authController.currentUser)) {
        return <BehaviorAdminDashboardItemList />;
      }
      if (isBehaviorUser(authController.currentUser)) {
        return <BehaviorUserDashboardItemList />;
      }
    }
    return <div />;
  };

  // switch script and fix bug
  const setStepAndRule = () => {
    if (authController.token) {
      StepsForRule(isSuperAdmin(authController.currentUser), setSteps, SuperAdmin);
      StepsForRule(
        isSuperAdminOrganization(authController.currentUser),
        setSteps,
        SuperAdminOrganization
      );
      StepsForRule(isTimeKeepingAdmin(authController.currentUser), setSteps, TimeKeepingAdmin);
      StepsForRule(isTimeKeepingUser(authController.currentUser), setSteps, TimeKeepingUser);
      StepsForRule(
        isAreaRestrictionAdmin(authController.currentUser),
        setSteps,
        AreaRestrictionAdmin
      );
      StepsForRule(
        isAreaRestrictionUser(authController.currentUser),
        setSteps,
        AreaRestrictionUser
      );
      StepsForRule(isBehaviorAdmin(authController.currentUser), setSteps, BehaviorAdmin);
      StepsForRule(isBehaviorUser(authController.currentUser), setSteps, BehaviorUser);
    }
  };

  const formView = (closeView: Function) => <FormCamera handleClose={closeView} />;

  const showModalContent = () => {
    if (actionType === VIEW_TYPE) return formView(handleClose);
    return <div />;
  };

  return (
    <>
      <DashboardLayout data-tut="reactour__end">
        <MDBox data-tut="reactour__two" key={seed}>
          {renderDashboardItems()}
        </MDBox>
        <Grid container mt={-1} spacing={2}>
          <Grid
            item
            xs={isHasRightComponent ? 8.5 : 12}
            md={isHasRightComponent ? 8.5 : 12}
            lg={isHasRightComponent ? 8.5 : 12}
          >
            {isShowCameraList ? (
              <MDBox display="flex" flexDirection="row-reverse">
                <MDBox>
                  <Button
                    size="large"
                    style={{ color: "#7b809a", padding: 0 }}
                    onClick={() => handleView()}
                    sx={{ background: "none" }}
                  >
                    <Icon fontSize="large" data-tut="reactour__three">
                      dashboard
                    </Icon>
                  </Button>
                </MDBox>
                <Grid
                  container
                  spacing={2}
                  style={{
                    maxHeight: "68vh",
                    overflowY: "auto",
                    lineHeight: 0,
                    overflowX: "hidden",
                  }}
                >
                  {cameraList.map((camera, index) => (
                    <CameraViewItem
                      key={`${camera?.name}_${camera?.id}`}
                      camera={camera}
                      numberInRow={isHasRightComponent ? 2 : 3}
                    />
                  ))}
                </Grid>
              </MDBox>
            ) : (
              <div />
            )}
          </Grid>
          {isHasRightComponent ? (
            <Grid item xs={3.5} md={3.5} lg={3.5}>
              <UserAttendance />
            </Grid>
          ) : (
            <div />
          )}
        </Grid>
      </DashboardLayout>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>{showModalContent()}</>
      </Modal>
      <FirstModal />
    </>
  );
}

export default Dashboard;
