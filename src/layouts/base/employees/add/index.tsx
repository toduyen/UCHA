import React, { useState } from "react";
import { addEmployeeApi } from "layouts/base/employees/api";
import {
  checkMaxLengthOfString,
  isValidEmail,
  isValidEmployeeCode,
  isValidPhone,
} from "utils/helpers";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import {
  CREATE_LABEL,
  ERROR_TYPE,
  FORCE_UPDATE_EMPLOYEE_CONTENT,
  FORCE_UPDATE_EMPLOYEE_TITLE,
  SUCCESS_TYPE,
  UPDATE_SUCCESS,
} from "constants/app";
import {
  AVATAR_EMPTY_ERROR,
  CODE_EMPLOYEE_EMPTY_ERROR,
  CODE_INVALID_ERROR,
  EMAIL_EMPTY_ERROR,
  EMAIL_INVALID_ERROR,
  CHAR_MAX_LENGTH,
  FULLNAME_EMPTY_ERROR,
  PHONE_EMPTY_ERROR,
  PHONE_INVALID_ERROR,
  SHIFT_EMPTY_ERROR,
} from "constants/validate";
import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { ADD_SUCCESS } from "../../../../constants/app";
import { Shift } from "../../../../models/time-keeping/shift";
import AvatarUser from "../../../../components/customizes/AvatarUser";
import { getShiftFromName } from "../util";
import { useAuthenController } from "../../../../context/authenContext";
import {
  addEmployeeSuccess,
  updateEmployeeSuccess,
  useEmployeeController,
} from "../../../../context/employeeContext";
import { useShiftController } from "../../../../context/shiftContext";
import { isTimeKeepingModule } from "utils/checkRoles";
import AreaRestrictionTime from "../components/AreaRestrictionTime";
import { Button, Modal } from "@mui/material";
import { AreaEmployeeTimeType } from "types/areaEmployeeTimeType";
import EmployeeAutocomplete from "../components/EmployeeAutocomplete";
import { Employee } from "../../../../models/base/employee";
import { EMPLOYEE_EXISTED_CODE } from "../../../../constants/responseCode";
import ConfirmUpdateForm from "../components/ConfirmUpdateForm";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import {
  CODE_FIELD,
  EMAIL_FIELD,
  IMAGE_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
  SHIFT_IDS_FIELD,
} from "../../../../constants/field";

const initAreaEmployeeTime: AreaEmployeeTimeType = {
  areaRestriction: null,
  timeStart: null,
  timeEnd: null,
  isInit: true,
};

function AddEmployee({ handleClose }: { handleClose: any }) {
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [manager, setManager] = useState<Employee | null>(null);
  const [shiftNames, setShiftNames] = useState([]);
  const [open, setOpen] = useState(false);
  // const [confirmUpdate, setConfirmUpdate] = useState(false);

  const [errorAvatar, setErrorAvatar] = useState("");
  const [errorName, setErrorName] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorShiftNames, setErrorShiftNames] = useState("");
  const [showError, setShowError] = useState<boolean>(true);

  const [rowsData, setRowData] = useState<Array<AreaEmployeeTimeType>>([]);
  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [, employeeDispatch] = useEmployeeController();
  // @ts-ignore
  const [shiftController] = useShiftController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();
  const handleCloseConfirmUpdateForm = () => {
    setOpen(false);
  };

  const fieldsNoShift = [
    {
      data: name,
      type: "text",
      label: "Họ và tên *",
      action: setName,
      actionBlur: setErrorName,
      error: errorName,
    },
    {
      data: code,
      type: "text",
      label: "Mã số nhân viên *",
      action: setCode,
      actionBlur: setErrorCode,
      error: errorCode,
    },
    {
      data: phone,
      type: "text",
      label: "Số điện thoại *",
      action: setPhone,
      actionBlur: setErrorPhone,
      error: errorPhone,
    },
    {
      data: email,
      type: "text",
      label: "Email *",
      action: setEmail,
      actionBlur: setErrorEmail,
      error: errorEmail,
    },
  ];

  const fieldsWithShift = [
    ...fieldsNoShift,
    {
      data: shiftController.shifts.map((shift: Shift) => shift.name),
      type: "autocomplete-multiple",
      label: "Ca làm việc *",
      action: setShiftNames,
      error: errorShiftNames,
    },
  ];

  const resetError = () => {
    setErrorName("");
    setErrorEmail("");
    setErrorCode("");
    setErrorPhone("");
    setErrorShiftNames("");
    setErrorAvatar("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (avatar === null) {
      setErrorAvatar(AVATAR_EMPTY_ERROR);
      checkValid = false;
    }
    if (name === null || name.trim() === "") {
      setErrorName(FULLNAME_EMPTY_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(name.trim())) {
      setErrorName(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (code === null || code.trim() === "") {
      setErrorCode(CODE_EMPLOYEE_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidEmployeeCode(code.trim())) {
      // validate code
      setErrorCode(CODE_INVALID_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(code.trim())) {
      setErrorCode(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (phone === null || phone.trim() === "") {
      setErrorPhone(PHONE_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidPhone(phone.trim())) {
      setErrorPhone(PHONE_INVALID_ERROR);
      checkValid = false;
    }
    if (email === null || email.trim() === "") {
      setErrorEmail(EMAIL_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidEmail(email)) {
      setErrorEmail(EMAIL_INVALID_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(email)) {
      setErrorEmail(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (isTimeKeepingModule() && shiftNames.length === 0) {
      setErrorShiftNames(SHIFT_EMPTY_ERROR);
      checkValid = false;
    }
    return checkValid;
  };

  const handleAddAreaRestrictionTime = () => {
    setRowData((prevState: any) => [...prevState, initAreaEmployeeTime]);
  };

  const handleUpdate = (index: number, newValue: AreaEmployeeTimeType | null) => {
    if (!newValue) {
      const rowsDataTmp = [...rowsData];
      rowsDataTmp.splice(index, 1);
      setRowData(rowsDataTmp);
    } else {
      const rowsDataTmp = [...rowsData];
      rowsDataTmp[index] = newValue;
      setRowData(rowsDataTmp);
    }
  };
  const check = () => {
    let conditionUpdate = true;
    setShowError(!showError);
    rowsData.forEach((item: AreaEmployeeTimeType) => {
      if (
        item.timeStart === null ||
        item.timeEnd === null ||
        item.areaRestriction === null ||
        item.timeStart.toLocaleString() === "Invalid Date" ||
        item.timeEnd.toLocaleString() === "Invalid Date"
      ) {
        conditionUpdate = false;
      }
    });
    return conditionUpdate;
  };
  const convertAreaEmployee = () => {
    let result = "";
    rowsData.forEach((item: AreaEmployeeTimeType) => {
      if (
        item.timeStart === null ||
        item.timeEnd === null ||
        item.areaRestriction === null ||
        item.timeStart.toLocaleString() === "Invalid Date" ||
        item.timeEnd.toLocaleString() === "Invalid Date"
      ) {
        return;
      }

      const timeStartStr = item.timeStart.toLocaleTimeString("vi-VN", { hour12: false });
      const timeEndStr = item.timeEnd.toLocaleTimeString("vi-VN", { hour12: false });
      const { areaRestriction } = item;
      if (areaRestriction !== null) {
        result += `{"area_restriction_id":${areaRestriction.id},"time_start":"${timeStartStr}","time_end":"${timeEndStr}"},`;
      }
    });
    if (result.length > 1) {
      result = `[${result.substring(0, result.length - 1)}]`;
    }
    return result;
  };

  const getAddEmployeeResponse = async ({ confirmUpdate }: { confirmUpdate?: boolean }) => {
    if (isValid()) {
      const shiftIds = shiftNames
        .map((shiftName) => getShiftFromName(shiftController.shifts, shiftName))
        .filter((shift) => shift !== null)
        .map((shift) => shift!.id)
        .join(",");
      return await addEmployeeApi({
        token: authController.token,
        avatar,
        name: validateTextField(name),
        code: validateTextField(code),
        phone: validateTextField(phone),
        email: validateTextField(email),
        managerId: manager ? manager.id : null,
        areaEmployee: convertAreaEmployee(),
        shifts: `[${shiftIds}]`,
        confirmUpdate,
      });
    }
    return null;
  };
  const handleCreateEmployee = async () => {
    if (isValid()) {
      if (check()) {
        const addEmployeeResponse = await getAddEmployeeResponse({ confirmUpdate: false });
        if (addEmployeeResponse) {
          if (addEmployeeResponse.data !== null) {
            if (addEmployeeResponse.data === EMPLOYEE_EXISTED_CODE) {
              setOpen(true);
            } else {
              showSnackbar(snackbarDispatch, {
                typeSnackbar: SUCCESS_TYPE,
                messageSnackbar: ADD_SUCCESS,
              });
              handleClose();
              addEmployeeSuccess(employeeDispatch, addEmployeeResponse.data);
            }
          } else if (addEmployeeResponse.fieldError) {
            switch (addEmployeeResponse.fieldError) {
              case NAME_FIELD:
                setErrorName(addEmployeeResponse.messageError);
                break;
              case CODE_FIELD:
                setErrorCode(addEmployeeResponse.messageError);
                break;
              case EMAIL_FIELD:
                setErrorEmail(addEmployeeResponse.messageError);
                break;
              case PHONE_FIELD:
                setErrorPhone(addEmployeeResponse.messageError);
                break;
              case SHIFT_IDS_FIELD:
                setErrorShiftNames(addEmployeeResponse.messageError);
                break;
              case IMAGE_FIELD:
                setErrorAvatar(addEmployeeResponse.messageError);
                break;
              default:
                showSnackbar(snackbarDispatch, {
                  typeSnackbar: ERROR_TYPE,
                  messageSnackbar: addEmployeeResponse.messageError,
                });
            }
          } else {
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: addEmployeeResponse.messageError,
            });
          }
        }
      }
    }
  };

  const handleForceCreateEmployee = async () => {
    if (isValid()) {
      const addEmployeeResponse = await getAddEmployeeResponse({ confirmUpdate: true });
      if (addEmployeeResponse) {
        if (addEmployeeResponse.data !== null) {
          if (addEmployeeResponse.data === EMPLOYEE_EXISTED_CODE) {
            setOpen(true);
          } else {
            showSnackbar(snackbarDispatch, {
              typeSnackbar: SUCCESS_TYPE,
              messageSnackbar: UPDATE_SUCCESS,
            });
            handleClose();
            updateEmployeeSuccess(employeeDispatch, addEmployeeResponse.data);
          }
        } else {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: ERROR_TYPE,
            messageSnackbar: addEmployeeResponse.messageError,
          });
        }
      }
    }
  };
  const dataEmployeeDefault = () => ({
    avatar: null,
    name: "",
    code: "",
    phone: "",
    email: "",
    managerId: null,
    shifts: [],
    areaEmployee: [],
    timeStart: [],
    timeEnd: [],
  });

  const isDataChange = () => {
    const dataEmployee = dataEmployeeDefault();
    const dataAfter = {
      avatar,
      name,
      code,
      phone,
      email,
      managerId: manager !== null ? manager.id : null,
      shifts: shiftNames,
      areaEmployee: rowsData?.map((item) => item.areaRestriction?.id),
      timeStart: rowsData?.map((item) => item.timeStart),
      timeEnd: rowsData?.map((item) => item.timeEnd),
    };
    return JSON.stringify(dataEmployee) !== JSON.stringify(dataAfter);
  };

  return (
    <>
      {isTimeKeepingModule() ? (
        <FormAddOrUpdate
          title="Thêm nhân viên"
          fields={fieldsWithShift}
          handleAddOrUpdate={handleCreateEmployee}
          actionLabel={CREATE_LABEL}
          visibleCloseButton
          handleClose={handleClose}
          headChildren={
            <AvatarUser
              avatar={avatar}
              handleFile={(file) => setAvatar(file)}
              error={errorAvatar}
            />
          }
          showConfirmClose={isDataChange()}
          isShow={open}
        >
          <EmployeeAutocomplete
            label="Người quản lý"
            type="autocomplete"
            handleChoose={(employees) => {
              if (employees.length > 0) {
                setManager(employees[0]);
              } else setManager(null);
            }}
            status="active"
          />
        </FormAddOrUpdate>
      ) : (
        <FormAddOrUpdate
          title="Thêm nhân viên"
          fields={fieldsNoShift}
          handleAddOrUpdate={handleCreateEmployee}
          actionLabel={CREATE_LABEL}
          visibleCloseButton
          handleClose={handleClose}
          headChildren={
            <AvatarUser
              avatar={avatar}
              handleFile={(file) => setAvatar(file)}
              error={errorAvatar}
            />
          }
          showConfirmClose={isDataChange()}
          isShow={open}
        >
          <>
            <EmployeeAutocomplete
              label="Người quản lý"
              type="autocomplete"
              handleChoose={(employees) => {
                if (employees.length > 0) {
                  setManager(employees[0]);
                } else setManager(null);
              }}
              status="active"
            />
            {rowsData.map((item: AreaEmployeeTimeType, index: number) => (
              <AreaRestrictionTime
                key={index}
                areaRestrictionTime={item}
                position={index}
                handleUpdate={handleUpdate}
                showError={showError}
              />
            ))}
            <Button
              onClick={handleAddAreaRestrictionTime}
              style={{
                padding: "0",
                fontWeight: "400",
                fontSize: "12px",
                textTransform: "initial",
              }}
            >
              Thêm khu vực, thời gian cho phép
            </Button>
          </>
        </FormAddOrUpdate>
      )}
      <Modal
        open={open}
        onClose={handleCloseConfirmUpdateForm}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ConfirmUpdateForm
          title={FORCE_UPDATE_EMPLOYEE_TITLE}
          handleConfirmUpdate={async () => {
            await handleForceCreateEmployee();
          }}
          handleClose={handleCloseConfirmUpdateForm}
        >
          <p>{FORCE_UPDATE_EMPLOYEE_CONTENT}</p>
        </ConfirmUpdateForm>
      </Modal>
    </>
  );
}

export default AddEmployee;
