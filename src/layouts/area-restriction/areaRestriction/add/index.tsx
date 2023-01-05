import MDBox from "components/bases/MDBox";
import MDTimePicker from "components/bases/MDTimePicker";
import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { CREATE_LABEL, EMPTY_TIME, ERROR_TYPE, INVALID_TIME, SUCCESS_TYPE } from "constants/app";
import {
  AREA_CODE_IS_NOT_VALID,
  CHAR_MAX_LENGTH,
  CREATE_AREA_RESTRICTION_SUCCESS,
  NAME_AREA_EMPTY_ERROR,
  NAME_CODE_EMPTY_ERROR,
  PERSONNEL_IN_CHARGE_EMPTY_ERROR,
  TIME_END_IS_NOT_VALID,
  TIME_IS_REQUIRE,
  TIME_START_IS_NOT_VALID,
} from "constants/validate";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import React, { useState } from "react";
import { addAreaRestrictionApi } from "../api";
import {
  addAreaRestrictionSuccess,
  useAreaRestrictionController,
} from "../../../../context/areaRestrictionContext";
import { useAuthenController } from "../../../../context/authenContext";
import { Employee } from "../../../../models/base/employee";
import EmployeeAutocomplete from "../../../base/employees/components/EmployeeAutocomplete";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import {
  CODE_FIELD,
  MANAGER_IDS_FIELD,
  NAME_FIELD,
  TIME_END_FIELD,
  TIME_START_FIELD,
} from "../../../../constants/field";
import { checkMaxLengthOfString, isValidAreaRestrictionCode } from "../../../../utils/helpers";

function AddAreaRestriction({ handleClose }: { handleClose: any }) {
  const [areaName, setAreaName] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [personnelInCharges, setPersonnelInCharges] = useState<Array<Employee>>([]);
  const [timeStart, setTimeStart] = useState<string | null>("");
  const [timeEnd, setTimeEnd] = useState<string | null>("");

  const [errorAreaName, setErrorAreaName] = useState("");
  const [errorAreaCode, setErrorAreaCode] = useState("");
  const [errorPersonnelInCharges, setErrorPersonnelInCharges] = useState("");
  const [errorTimeStart, setErrorTimeStart] = useState("");
  const [errorTimeEnd, setErrorTimeEnd] = useState("");

  const [checkTimeStart, setCheckTimeStart] = useState<string | null>();
  const [checkTimeEnd, setCheckTimeEnd] = useState<string | null>();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  // @ts-ignore
  const [, areaRestrictionDispatch] = useAreaRestrictionController();

  // @ts-ignore
  const [authController] = useAuthenController();

  const fields = [
    {
      data: areaName,
      type: "areaName",
      label: "Tên khu vực *",
      action: setAreaName,
      actionBlur: setErrorAreaName,
      error: errorAreaName,
    },
    {
      data: areaCode,
      type: "areaCode",
      label: "Mã khu vực *",
      action: setAreaCode,
      actionBlur: setErrorAreaCode,
      error: errorAreaCode,
    },
  ];
  const handleChangeStartTime = (time: Date | null) => {
    if (time !== null && time.toLocaleString() !== "Invalid Date") {
      setTimeStart(time.toLocaleTimeString("vi-VN", { hour12: false }));
      setCheckTimeStart(null);
    } else if (time?.toLocaleString() === "Invalid Date") {
      setTimeStart("");
      setCheckTimeStart(INVALID_TIME);
    } else {
      setCheckTimeStart(EMPTY_TIME);
      setTimeStart(null);
    }
  };
  const handleChangeEndTime = (time: Date | null) => {
    if (time !== null && time.toLocaleString() !== "Invalid Date") {
      setTimeEnd(time.toLocaleTimeString("vi-VN", { hour12: false }));
      setCheckTimeEnd(null);
    } else if (time?.toLocaleString() === "Invalid Date") {
      setTimeEnd("");
      setCheckTimeEnd(INVALID_TIME);
    } else {
      setCheckTimeEnd(EMPTY_TIME);
      setTimeEnd(null);
    }
  };
  const resetError = () => {
    setErrorAreaName("");
    setErrorAreaCode("");
    setErrorPersonnelInCharges("");
    setErrorTimeStart("");
    setErrorTimeEnd("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (areaName === null || areaName.trim() === "") {
      setErrorAreaName(NAME_AREA_EMPTY_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(areaName.trim())) {
      setErrorAreaName(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (areaCode === null || areaCode.trim() === "") {
      setErrorAreaCode(NAME_CODE_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidAreaRestrictionCode(areaCode.trim())) {
      setErrorAreaCode(AREA_CODE_IS_NOT_VALID);
      checkValid = false;
    } else if (!checkMaxLengthOfString(areaCode.trim())) {
      setErrorAreaCode(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (personnelInCharges.length === 0) {
      setErrorPersonnelInCharges(PERSONNEL_IN_CHARGE_EMPTY_ERROR);
      checkValid = false;
    }
    if (timeStart === "" || checkTimeStart === EMPTY_TIME) {
      setErrorTimeStart(TIME_IS_REQUIRE);
      checkValid = false;
    }
    if (checkTimeStart === INVALID_TIME) {
      setErrorTimeStart(TIME_START_IS_NOT_VALID);
      checkValid = false;
    }
    if (timeEnd === "" || checkTimeEnd === EMPTY_TIME) {
      setErrorTimeEnd(TIME_IS_REQUIRE);
      checkValid = false;
    }
    if (checkTimeEnd === INVALID_TIME) {
      setErrorTimeEnd(TIME_END_IS_NOT_VALID);
      checkValid = false;
    }
    return checkValid;
  };

  const handleAddAreaRestriction = async () => {
    if (isValid()) {
      const managerIds: Array<number> = personnelInCharges.map((item) => item.id);
      if (authController.token) {
        const addAreaRestrictionResponse = await addAreaRestrictionApi({
          token: authController.token,
          areaName: validateTextField(areaName),
          areaCode: validateTextField(areaCode),
          personnelInCharge: managerIds,
          timeStart,
          timeEnd,
        });

        if (addAreaRestrictionResponse.data !== null) {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: SUCCESS_TYPE,
            messageSnackbar: CREATE_AREA_RESTRICTION_SUCCESS,
          });
          handleClose();
          addAreaRestrictionSuccess(areaRestrictionDispatch, addAreaRestrictionResponse.data);
        } else if (addAreaRestrictionResponse.fieldError) {
          switch (addAreaRestrictionResponse.fieldError) {
            case NAME_FIELD:
              setErrorAreaName(addAreaRestrictionResponse.messageError);
              break;
            case CODE_FIELD:
              setErrorAreaCode(addAreaRestrictionResponse.messageError);
              break;
            case MANAGER_IDS_FIELD:
              setErrorPersonnelInCharges(addAreaRestrictionResponse.messageError);
              break;
            case TIME_START_FIELD:
              setErrorTimeStart(addAreaRestrictionResponse.messageError);
              break;
            case TIME_END_FIELD:
              setErrorTimeEnd(addAreaRestrictionResponse.messageError);
              break;
            default:
              showSnackbar(snackbarDispatch, {
                typeSnackbar: ERROR_TYPE,
                messageSnackbar: addAreaRestrictionResponse.messageError,
              });
          }
        } else {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: ERROR_TYPE,
            messageSnackbar: addAreaRestrictionResponse.messageError,
          });
        }
      }
    }
  };
  const dataAreaRestrictionDefault = () => ({
    areaName: "",
    areaCode: "",
    personnelInChargeId: [],
    timeEnd: "",
    timeStart: "",
  });

  const isDataChange = () => {
    const dataAreaRestriction = dataAreaRestrictionDefault();
    const dataAfter = {
      areaName,
      areaCode,
      personnelInChargeId: personnelInCharges?.map((item) => item.id),
      timeEnd,
      timeStart,
    };
    return JSON.stringify(dataAreaRestriction) !== JSON.stringify(dataAfter);
  };
  return (
    <FormAddOrUpdate
      title="Thêm khu vực hạn chế"
      fields={fields}
      handleAddOrUpdate={handleAddAreaRestriction}
      actionLabel={CREATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    >
      <>
        <EmployeeAutocomplete
          type="autocomplete-multiple"
          label="Nhân sự phụ trách *"
          error={errorPersonnelInCharges}
          handleChoose={(employees) => {
            setPersonnelInCharges(employees);
          }}
          status="active"
        />
        <MDBox display="flex" flexDirection="row" justifyContent="space-between" gap={2}>
          <MDTimePicker
            label="Thời gian bắt đầu *"
            time={null}
            error={errorTimeStart}
            handleChooseTime={(time: any) => handleChangeStartTime(time)}
          />
          <MDTimePicker
            label="Thời gian kết thúc *"
            time={null}
            error={errorTimeEnd}
            handleChooseTime={(time: any) => {
              handleChangeEndTime(time);
            }}
          />
        </MDBox>
      </>
    </FormAddOrUpdate>
  );
}

export default AddAreaRestriction;
