import MDBox from "components/bases/MDBox";
import MDTimePicker from "components/bases/MDTimePicker";
import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import {
  EMPTY_TIME,
  ERROR_TYPE,
  INVALID_TIME,
  SUCCESS_TYPE,
  UPDATE_LABEL,
  UPDATE_SUCCESS,
} from "constants/app";
import React, { useState } from "react";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import {
  checkMaxLengthOfString,
  convertTimeStringToDate,
  isValidAreaRestrictionCode,
} from "utils/helpers";
import {
  AREA_CODE_IS_NOT_VALID,
  CHAR_MAX_LENGTH,
  NAME_AREA_EMPTY_ERROR,
  NAME_CODE_EMPTY_ERROR,
  PERSONNEL_IN_CHARGE_EMPTY_ERROR,
  TIME_END_IS_NOT_VALID,
  TIME_IS_REQUIRE,
  TIME_START_IS_NOT_VALID,
} from "constants/validate";
import { updateAreaRestrictionApi } from "../api";
import { AreaRestriction } from "models/area-restriction/areaRestriction";
import {
  updateAreaRestrictionSuccess,
  useAreaRestrictionController,
} from "context/areaRestrictionContext";
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

function EditFormAreaRestriction({
  handleClose,
  areaRestriction,
}: {
  handleClose: any;
  areaRestriction: AreaRestriction;
}) {
  const [areaName, setAreaName] = useState(areaRestriction.areaName);
  const [areaCode, setAreaCode] = useState(areaRestriction.areaCode);
  const [timeStart, setTimeStart] = useState<Date | null>(
    convertTimeStringToDate(areaRestriction.timeStart)
  );
  const [timeEnd, setTimeEnd] = useState<Date | null>(
    convertTimeStringToDate(areaRestriction.timeEnd)
  );
  const [personnelInCharges, setPersonnelInCharges] = useState<Array<Employee> | null>(
    areaRestriction.personnelInCharge
  );
  const [checkTimeStart, setCheckTimeStart] = useState<string | null>();
  const [checkTimeEnd, setCheckTimeEnd] = useState<string | null>();

  const [errorName, setErrorName] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorTimeStart, setErrorTimeStart] = useState("");
  const [errorTimeEnd, setErrorTimeEnd] = useState("");
  const [errorPersonnelInCharges, setErrorPersonnelInCharges] = useState("");

  // @ts-ignore
  const [authController] = useAuthenController();

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  // @ts-ignore
  const [, areaRestrictionDispatch] = useAreaRestrictionController();
  const fields = [
    {
      data: areaName,
      type: "areaName",
      label: "Tên khu vực *",
      action: setAreaName,
      error: errorName,
    },
    {
      data: areaCode,
      type: "areaCode",
      label: "Mã khu vực *",
      action: setAreaCode,
      error: errorCode,
    },
  ];

  const resetError = () => {
    setErrorName("");
    setErrorCode("");
    setErrorPersonnelInCharges("");
    setErrorTimeStart("");
    setErrorTimeEnd("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (areaName === null || areaName.trim() === "") {
      setErrorName(NAME_AREA_EMPTY_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(areaName.trim())) {
      setErrorName(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (areaCode === null || areaCode.trim() === "") {
      setErrorCode(NAME_CODE_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidAreaRestrictionCode(areaCode.trim())) {
      setErrorCode(AREA_CODE_IS_NOT_VALID);
      checkValid = false;
    } else if (!checkMaxLengthOfString(areaCode.trim())) {
      setErrorCode(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (personnelInCharges === null || personnelInCharges.length === 0) {
      setErrorPersonnelInCharges(PERSONNEL_IN_CHARGE_EMPTY_ERROR);
      checkValid = false;
    }
    if (checkTimeStart === EMPTY_TIME) {
      setErrorTimeStart(TIME_IS_REQUIRE);
      checkValid = false;
    }
    if (checkTimeStart === INVALID_TIME) {
      setErrorTimeStart(TIME_START_IS_NOT_VALID);
      checkValid = false;
    }
    if (checkTimeEnd === EMPTY_TIME) {
      setErrorTimeEnd(TIME_IS_REQUIRE);
      checkValid = false;
    }
    if (checkTimeEnd === INVALID_TIME) {
      setErrorTimeEnd(TIME_END_IS_NOT_VALID);
      checkValid = false;
    }
    return checkValid;
  };

  const handleUpdateAreaRestriction = async () => {
    if (isValid()) {
      areaRestriction.areaCode = validateTextField(areaCode);
      areaRestriction.areaName = validateTextField(areaName);
      areaRestriction.personnelInCharge = personnelInCharges || [];
      areaRestriction.timeStart = timeStart
        ? timeStart.toLocaleTimeString("vi-VN", { hour12: false })
        : "";
      areaRestriction.timeEnd = timeEnd
        ? timeEnd.toLocaleTimeString("vi-VN", { hour12: false })
        : "";

      const updateAreaRestrictionResponse = await updateAreaRestrictionApi({
        token: authController.token,
        areaRestriction,
      });
      if (updateAreaRestrictionResponse.data) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: UPDATE_SUCCESS,
        });

        handleClose();
        updateAreaRestrictionSuccess(areaRestrictionDispatch, updateAreaRestrictionResponse.data);
      } else if (updateAreaRestrictionResponse.fieldError) {
        switch (updateAreaRestrictionResponse.fieldError) {
          case NAME_FIELD:
            setErrorName(updateAreaRestrictionResponse.messageError);
            break;
          case CODE_FIELD:
            setErrorCode(updateAreaRestrictionResponse.messageError);
            break;
          case MANAGER_IDS_FIELD:
            setErrorPersonnelInCharges(updateAreaRestrictionResponse.messageError);
            break;
          case TIME_START_FIELD:
            setErrorTimeStart(updateAreaRestrictionResponse.messageError);
            break;
          case TIME_END_FIELD:
            setErrorTimeEnd(updateAreaRestrictionResponse.messageError);
            break;
          default:
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: updateAreaRestrictionResponse.messageError,
            });
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: updateAreaRestrictionResponse.messageError,
        });
      }
    }
  };

  const handleChangeStartTime = (time: Date | null) => {
    if (time !== null && time.toLocaleString() !== "Invalid Date") {
      setTimeStart(time);
      setCheckTimeStart(null);
    } else if (time?.toLocaleTimeString() === "Invalid Date") {
      setCheckTimeStart(INVALID_TIME);
    } else {
      setCheckTimeStart(EMPTY_TIME);
      setTimeStart(null);
    }
  };

  const handleChangeEndTime = (time: Date | null) => {
    if (time !== null && time.toLocaleString() !== "Invalid Date") {
      setTimeEnd(time);
      setCheckTimeEnd(null);
    } else if (time?.toLocaleTimeString() === "Invalid Date") {
      setCheckTimeEnd(INVALID_TIME);
    } else {
      setCheckTimeEnd(EMPTY_TIME);
      setTimeEnd(null);
    }
  };

  const dataAreaRestrictionDefault = () => ({
    areaName: areaRestriction?.areaName,
    areaCode: areaRestriction?.areaCode,
    personnelInChargeId: areaRestriction?.personnelInCharge?.map((item) => item.id),
    timeEnd: convertTimeStringToDate(areaRestriction.timeEnd).getTime(),
    timeStart: convertTimeStringToDate(areaRestriction.timeStart).getTime(),
  });

  const isDataChange = () => {
    const dataAreaRestriction = dataAreaRestrictionDefault();
    const dataAfter = {
      areaName,
      areaCode,
      personnelInChargeId: personnelInCharges?.map((item) => item.id),
      timeEnd: timeEnd?.getTime(),
      timeStart: timeStart?.getTime(),
    };
    return JSON.stringify(dataAreaRestriction) !== JSON.stringify(dataAfter);
  };
  return (
    <FormAddOrUpdate
      title="Cập nhật khu vực hạn chế"
      fields={fields}
      handleAddOrUpdate={handleUpdateAreaRestriction}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    >
      <>
        <EmployeeAutocomplete
          type="autocomplete-multiple"
          label="Nhân sự phụ trách *"
          defaultData={personnelInCharges}
          handleChoose={(employees) => {
            setPersonnelInCharges(employees);
          }}
          error={errorPersonnelInCharges}
          status="active"
        />
        <MDBox display="flex" flexDirection="row" justifyContent="space-between" gap={2}>
          <MDTimePicker
            label="Thời gian bắt đầu *"
            time={timeStart}
            error={errorTimeStart}
            handleChooseTime={(time: any) => {
              handleChangeStartTime(time);
            }}
          />
          <MDTimePicker
            label="Thời gian kết thúc *"
            time={timeEnd}
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

export default EditFormAreaRestriction;
