import React, { useEffect, useState } from "react";
import { updateEmployeeApi } from "layouts/base/employees/api";
import {
  checkMaxLengthOfString,
  convertTimeStringToDate,
  getNameImageInUrl,
  isValidEmail,
  isValidPhone,
} from "utils/helpers";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { ERROR_TYPE, SUCCESS_TYPE, UPDATE_LABEL, UPDATE_SUCCESS } from "constants/app";
import {
  EMAIL_EMPTY_ERROR,
  EMAIL_INVALID_ERROR,
  CHAR_MAX_LENGTH,
  FULLNAME_EMPTY_ERROR,
  PHONE_EMPTY_ERROR,
  PHONE_INVALID_ERROR,
  SHIFT_EMPTY_ERROR,
} from "constants/validate";
import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { Employee } from "models/base/employee";
import { Shift } from "models/time-keeping/shift";
import AvatarUser from "components/customizes/AvatarUser";
import { getShiftFromName } from "../util";
import { useAuthenController } from "../../../../context/authenContext";
import { updateEmployeeSuccess, useEmployeeController } from "../../../../context/employeeContext";
import { useShiftController } from "../../../../context/shiftContext";
import { isTimeKeepingModule } from "utils/checkRoles";
import { Button } from "@mui/material";
import AreaRestrictionTime from "../components/AreaRestrictionTime";
import { AreaEmployeeTimeType } from "types/areaEmployeeTimeType";
import EmployeeAutocomplete from "../components/EmployeeAutocomplete";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import {
  CODE_FIELD,
  EMAIL_FIELD,
  IMAGE_FIELD,
  MANAGER_ID_FIELD,
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

function UpdateEmployee({ handleClose, employee }: { handleClose: any; employee: Employee }) {
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState(employee.name);
  const [code, setCode] = useState(employee.code);
  const [phone, setPhone] = useState(employee.phone);
  const [email, setEmail] = useState(employee.email);
  const [manager, setManager] = useState<Employee | null>(employee.manager);
  const [shiftNames, setShiftNames] = useState(employee.shifts.map((shift) => shift.name));

  const [errorName, setErrorName] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorShiftNames, setErrorShiftNames] = useState("");
  const [errorAvatar, setErrorAvatar] = useState("");
  const [errorManager, setErrorManager] = useState("");
  const [showError, setShowError] = useState<boolean>(true);

  const convertAreaEmployees = (): Array<AreaEmployeeTimeType> =>
    employee.areaEmployees.map((item) => ({
      areaRestriction: item.areaRestriction,
      timeStart: convertTimeStringToDate(item.timeStart),
      timeEnd: convertTimeStringToDate(item.timeEnd),
      isInit: false,
    }));
  const [rowsData, setRowData] = useState<Array<AreaEmployeeTimeType>>(convertAreaEmployees());
  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [employeeController, employeeDispatch] = useEmployeeController();
  // @ts-ignore
  const [shiftController] = useShiftController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();
  useEffect(() => {
    const temp = employeeController.employees.filter((e: Employee) => e.id === employee.id)[0];
    setManager(temp.manager);
  }, []);

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
      disabled: true,
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
      checked: shiftNames,
      type: "autocomplete-multiple",
      label: "Ca làm việc *",
      action: setShiftNames,
      actionBlur: setErrorShiftNames,
      error: errorShiftNames,
    },
  ];
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

  const check = () => {
    let isValid = true;
    setShowError(!showError);
    rowsData.forEach((item: AreaEmployeeTimeType) => {
      if (
        item.timeStart === null ||
        item.timeEnd === null ||
        item.areaRestriction === null ||
        item.timeStart.toLocaleString() === "Invalid Date" ||
        item.timeEnd.toLocaleString() === "Invalid Date"
      ) {
        isValid = false;
      }
    });
    return isValid;
  };
  const resetError = () => {
    setErrorName("");
    setErrorEmail("");
    setErrorPhone("");
    setErrorShiftNames("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (name === null || name.trim() === "") {
      setErrorName(FULLNAME_EMPTY_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(name.trim())) {
      setErrorName(CHAR_MAX_LENGTH);
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
    if (phone === null || phone.trim() === "") {
      setErrorPhone(PHONE_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidPhone(phone)) {
      setErrorPhone(PHONE_INVALID_ERROR);
      checkValid = false;
    }
    if (isTimeKeepingModule() && shiftNames.length === 0) {
      setErrorShiftNames(SHIFT_EMPTY_ERROR);
      checkValid = false;
    }

    return checkValid;
  };
  const handleUpdateEmployee = async () => {
    if (isValid()) {
      if (check()) {
      const shiftIds = shiftNames
        .map((shiftName) => getShiftFromName(shiftController.shifts, shiftName))
        .filter((shift) => shift !== null)
        .map((shift) => shift!.id)
        .sort((a, b) => a - b)
        .join(",");
      const updateEmployeeResponse = await updateEmployeeApi({
        token: authController.token,
        employeeId: employee.id,
        avatar,
        name: validateTextField(name),
        code: validateTextField(code),
        phone: validateTextField(phone),
        email: validateTextField(email),
        managerId: manager !== null ? manager.id : null,
        shifts: `[${shiftIds}]`,
        areaEmployee: convertAreaEmployee(),
      });
      if (updateEmployeeResponse.data !== null) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: UPDATE_SUCCESS,
        });
        handleClose();
        updateEmployeeSuccess(employeeDispatch, updateEmployeeResponse.data);
      } else if (updateEmployeeResponse.fieldError) {
        switch (updateEmployeeResponse.fieldError) {
          case NAME_FIELD:
            setErrorName(updateEmployeeResponse.messageError);
            break;
          case CODE_FIELD:
            setErrorCode(updateEmployeeResponse.messageError);
            break;
          case EMAIL_FIELD:
            setErrorEmail(updateEmployeeResponse.messageError);
            break;
          case PHONE_FIELD:
            setErrorPhone(updateEmployeeResponse.messageError);
            break;
          case SHIFT_IDS_FIELD:
            setErrorShiftNames(updateEmployeeResponse.messageError);
            break;
          case IMAGE_FIELD:
            setErrorAvatar(updateEmployeeResponse.messageError);
            break;
          case MANAGER_ID_FIELD:
            setErrorManager(updateEmployeeResponse.messageError);
            break;
          default:
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: updateEmployeeResponse.messageError,
            });
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: updateEmployeeResponse.messageError,
        });
      }
    }}
  };
  const dataEmployeeDefault = () => ({
    avatar: getNameImageInUrl(employee?.image?.path),
    employeeId: employee.id,
    name: employee?.name,
    code: employee?.code,
    phone: employee?.phone,
    email: employee?.email,
    managerId: employee?.manager !== null ? employee.manager.id : null,
    shifts: employee.shifts.map((shift) => shift.name),
    areaEmployee: convertAreaEmployees()?.map((item) => item.areaRestriction?.id),
    timeStart: convertAreaEmployees()?.map((item) => item.timeStart),
    timeEnd: convertAreaEmployees()?.map((item) => item.timeEnd),
  });

  const isDataChange = () => {
    const dataEmployee = dataEmployeeDefault();
    const dataAfter = {
      avatar:
        avatar !== null
          ? // @ts-ignore
            getNameImageInUrl(avatar?.path)
          : getNameImageInUrl(employee?.image?.path),
      employeeId: employee.id,
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
  return isTimeKeepingModule() ? (
    <FormAddOrUpdate
      title="Cập nhật nhân viên"
      fields={fieldsWithShift}
      handleAddOrUpdate={handleUpdateEmployee}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      headChildren={
        <AvatarUser
          avatar={employee.image}
          handleFile={(file) => setAvatar(file)}
          error={errorAvatar}
        />
      }
      showConfirmClose={isDataChange()}
    >
      <EmployeeAutocomplete
        defaultData={manager ? Array.of(manager) : null}
        type="autocomplete"
        label="Người quản lý"
        handleChoose={(employees) => {
          setErrorManager("");
          if (employees.length > 0) {
            setManager(employees[0]);
          } else setManager(null);
        }}
        status="active"
        error={errorManager}
      />
    </FormAddOrUpdate>
  ) : (
    <FormAddOrUpdate
      title="Cập nhật nhân viên"
      fields={fieldsNoShift}
      handleAddOrUpdate={handleUpdateEmployee}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      headChildren={
        <AvatarUser
          avatar={employee.image}
          handleFile={(file) => setAvatar(file)}
          error={errorAvatar}
        />
      }
      showConfirmClose={isDataChange()}
    >
      <>
        <EmployeeAutocomplete
          defaultData={manager ? Array.of(manager) : null}
          type="autocomplete"
          label="Người quản lý"
          handleChoose={(employees) => {
            setErrorManager("");
            if (employees.length > 0) {
              setManager(employees[0]);
            } else setManager(null);
          }}
          status="active"
          error={errorManager}
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
          style={{ padding: "0", fontWeight: "400", fontSize: "12px", textTransform: "initial" }}
        >
          Thêm khu vực, thời gian cho phép
        </Button>
      </>
    </FormAddOrUpdate>
  );
}

export default UpdateEmployee;
