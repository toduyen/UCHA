import React, { useEffect, useState } from "react";
import BasePage from "layouts/base/basePage";
import inOutHistoryTableData from "./data";
import {
  isAreaRestrictionUser,
  isBehaviorUser,
  isTimeKeepingModule,
  isTimeKeepingUser,
} from "../../../utils/checkRoles";
import ExpandComponent from "../basePage/components/ExpandComponent";
import FilterForm from "./components/FilterForm";
import { useTour } from "@reactour/tour";
import { useAuthenController } from "../../../context/authenContext";
import { Getter } from "../../../components/customizes/ScriptTour/StateTour/Getter";
import StepsForRule from "../../../components/customizes/ScriptTour/StepsForRule";
import { Setter } from "../../../components/customizes/ScriptTour/StateTour/Setter";
import TimeKeepingUser from "../../../components/customizes/ScriptTour/ListScript/InOutHistory/TimeKeepingUser";
import AreaRestrictionUser from "../../../components/customizes/ScriptTour/ListScript/InOutHistory/AreaRestrictionUser";
import BehaviorUser from "../../../components/customizes/ScriptTour/ListScript/InOutHistory/BehaviorUser";
import { IN_OUT_HISTORY_TABLE_TITLE, IN_OUT_TABLE_TITLE } from "../../../constants/app";

function ExpandInOut() {
  const [statusOpenModal, setStatusOpenModal] = useState(false);
  return (
    <ExpandComponent
      statusOpenModal={statusOpenModal}
      handleOnClick={() => setStatusOpenModal(!statusOpenModal)}
      tooltipContent="Xem danh sách vào ra ngày hôm nay"
      data-inout-history="InOutHistory__step2"
      titleModal={IN_OUT_TABLE_TITLE}
    />
  );
}

function InOutHistory(): React.ReactElement {
  const [token, setToken] = useState(null);
  const [temp, setTemp] = useState(false);

  // @ts-ignore
  const [authController] = useAuthenController();
  const { setCurrentStep, setSteps, setIsOpen, isOpen } = useTour();

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

  useEffect(() => {
    if (isOpen) {
      setTemp(true);
    } else {
      setTemp(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (Getter()?.STATUS_IN_OUT_HISTORY === true && !isOpen) {
      Setter(Getter()?.STATUS_DASHBOARD, Getter()?.STATUS_CAMERA, !temp);
    }
  }, [temp, isOpen]);

  const setStepAndRule = () => {
    if (authController.token) {
      if (Getter()?.STATUS_IN_OUT_HISTORY === true) {
        StepsForRule(
          isAreaRestrictionUser(authController.currentUser),
          setSteps,
          AreaRestrictionUser
        );
        StepsForRule(isBehaviorUser(authController.currentUser), setSteps, BehaviorUser);
        StepsForRule(isTimeKeepingUser(authController.currentUser), setSteps, TimeKeepingUser);
        setCurrentStep(0);
        setIsOpen(true);
      }
    }
  };
  return (
    <BasePage
      tableTitle={IN_OUT_HISTORY_TABLE_TITLE}
      tableData={inOutHistoryTableData}
      ExpandForm={ExpandInOut}
      FilterForm={FilterForm}
      optionFeature={{
        enableCreate: false,
        enableImport: false,
        enableExport: false,
        enableExpand: isTimeKeepingModule(),
        enableSearch: false,
      }}
    />
  );
}

export default InOutHistory;
