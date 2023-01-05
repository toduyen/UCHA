import BasePage from "layouts/base/basePage";
import AddCamera from "./add";
import { deleteCameraApi } from "./api";
import cameraTableDatas from "./data";
import EditFormCamera from "./edit";
import ViewCamera from "./view";
import { deleteCameraSuccess, useCameraController } from "../../../context/cameraContext";
import SettingFormCamera from "./setting";
import { FilterFormCameraAreaRestriction } from "./components/FilterFormCameraAreaRestriction";
import { isAreaRestrictionUser, isBehaviorUser, isTimeKeepingModule } from "utils/checkRoles";
import { FilterFormCameraTimeKeeping } from "./components/FilterFormCameraTimeKeeping";
import { useTour } from "@reactour/tour";
// @ts-ignore
import { Getter } from "../../../components/customizes/ScriptTour/StateTour/Getter";
import { useAuthenController } from "../../../context/authenContext";
// @ts-ignore
import StepsForRule from "../../../components/customizes/ScriptTour/StepsForRule";
import AreaRestrictionUser from "../../../components/customizes/ScriptTour/ListScript/CameraSetting/AreaRestrictionUser";
// @ts-ignore
import { useEffect, useState } from "react";
import { Setter } from "../../../components/customizes/ScriptTour/StateTour/Setter";
import { CAMERA_TABLE_TITLE } from "../../../constants/app";

function Camera() {
  // @ts-ignore
  const [, cameraDispatch] = useCameraController();
  const { setCurrentStep, setSteps, isOpen } = useTour();
  const [token, setToken] = useState(null);

  // @ts-ignore
  const [authController] = useAuthenController();

  const [temp, setTemp] = useState(false);

  useEffect(() => {
    if (token) {
      setStepAndRule();
    }
  }, [token]);

  useEffect(() => {
    if (authController.token) {
      setToken(authController.token);
    }
  }, [authController.token]);

  const setStepAndRule = () => {
    if (authController.token) {
      if (Getter()?.STATUS_CAMERA === true) {
        StepsForRule(
          isAreaRestrictionUser(authController.currentUser),
          setSteps,
          AreaRestrictionUser
        );
        StepsForRule(isBehaviorUser(authController.currentUser), setSteps, AreaRestrictionUser);
        setCurrentStep(0);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setTemp(true), 400);
    } else {
      setTimeout(() => setTemp(false), 400);
    }
  }, [isOpen]);

  useEffect(() => {
    if (Getter()?.STATUS_CAMERA === true && !isOpen) {
      Setter(Getter()?.STATUS_DASHBOARD, !temp, Getter()?.STATUS_IN_OUT_HISTORY);
    }
  }, [temp, isOpen]);
  return (
    <BasePage
      tableTitle={CAMERA_TABLE_TITLE}
      tableData={cameraTableDatas}
      AddForm={({ handleClose }) => AddCamera({ handleClose })}
      EditForm={({ handleClose, item }) => EditFormCamera({ handleClose, camera: item })}
      ViewForm={({ handleClose, item }) => ViewCamera({ handleClose, camera: item })}
      SettingForm={({ handleClose, item }) => SettingFormCamera({ handleClose, camera: item })}
      FilterForm={
        isTimeKeepingModule() ? FilterFormCameraTimeKeeping : FilterFormCameraAreaRestriction
      }
      deleteAction={{
        actionDelete: (id) => deleteCameraSuccess(cameraDispatch, id),
        deleteApi: deleteCameraApi,
      }}
      optionFeature={{
        enableCreate: true,
        enableImport: false,
        enableExport: false,
      }}
    />
  );
}

export default Camera;
