// Render the notifications menu
import React, { useEffect, useState } from "react";
import { Popper } from "@mui/material";
import MDBox from "../../../../components/bases/MDBox";
import MDButton from "../../../../components/bases/MDButton";
import {
  hideLoading,
  showLoading,
  showSnackbar,
  useSnackbarController,
} from "../../../../context/snackbarContext";
import { Employee } from "../../../../models/base/employee";
import { getEmployeeFromName } from "../util";
import { changeManagerApi, updateEmployeeApi } from "../api";
import { Shift } from "../../../../models/time-keeping/shift";
import { useEmployeeController } from "../../../../context/employeeContext";
import { ERROR_TYPE, SUCCESS_TYPE, UPDATE_SUCCESS } from "../../../../constants/app";
import { AreaEmployee } from "../../../../models/area-restriction/areaEmployee";
import { useAuthenController } from "../../../../context/authenContext";
import { ManagerEmployeeType } from "../../../../types/managerEmployeeType";
import EmployeeAutocomplete from "./EmployeeAutocomplete";
import { MANAGER_ID_FIELD } from "../../../../constants/field";

export default function ChangeManagerForm({
  employeeRows,
  manager,
  actionAfterChange,
  anchorEl,
}: {
  employeeRows: Array<ManagerEmployeeType>;
  manager: ManagerEmployeeType;
  actionAfterChange: () => Promise<void>;
  anchorEl: any;
}) {
  const [newManager, setNewManager] = useState<Employee | null>(null);
  const [anchorElState, setAnchorElState] = useState(anchorEl);
  const [error, setError] = useState("");

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [employeeController, employeeDispatch] = useEmployeeController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  useEffect(() => {
    setAnchorElState(anchorEl);
    if (anchorEl) {
      if (manager.manager !== undefined && manager.manager.trim() !== "") {
        const [code, name] = manager.manager.split("-");
        // @ts-ignore
        setNewManager({
          id: manager.id,
          name,
          code,
        });
      } else {
        // eslint-disable-next-line prefer-destructuring
        setNewManager(null);
      }
    }
  }, [anchorEl]);

  const convertEmployeeCode = () => {
    let employeeCode = "";
    if (manager?.employees[0]?.code) {
      employeeCode = manager?.employees[0]?.code;
    }
    return employeeCode;
  };

  const submitChangeManager = async () => {
    if (manager.manager === undefined || manager.manager.trim() === "") {
      const employeeCode = convertEmployeeCode();
      const employeeName = convertEmployeeName();
      const managerName = `${employeeCode}-${employeeName}`;
      const employee = getEmployeeFromName(employeeController.employees, managerName);
      if (employee !== null) {
        const changeManagerResponse = await updateEmployeeApi({
          token: authController.token,
          employeeId: employee.id,
          avatar: null,
          name: employee.name,
          code: employee.code,
          phone: employee.phone,
          email: employee.email,
          managerId: newManager!.id,
          shifts: `[${employee.shifts.map((shift: Shift) => shift.id).join(",")}]`,
          areaEmployee: convertAreaEmployee(employee.areaEmployees),
        });
        if (changeManagerResponse.data !== null) {
          await actionAfterChange();
          setAnchorElState(null);
          showSnackbar(snackbarDispatch, {
            typeSnackbar: SUCCESS_TYPE,
            messageSnackbar: UPDATE_SUCCESS,
          });
        } else if (changeManagerResponse.fieldError) {
          switch (changeManagerResponse.fieldError) {
            case MANAGER_ID_FIELD:
              setError(changeManagerResponse.messageError);
              break;
            default:
              showSnackbar(snackbarDispatch, {
                typeSnackbar: ERROR_TYPE,
                messageSnackbar: changeManagerResponse.messageError,
              });
          }
        } else {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: ERROR_TYPE,
            messageSnackbar: changeManagerResponse.messageError,
          });
        }
      }
    } else {
      let oldManager = null;
      const tmp = employeeRows.filter((item: any) => item.manager === manager.manager);
      if (tmp.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        oldManager = tmp[0];
      }
      if (oldManager !== null && newManager !== null) {
        const changeManagerResponse = await changeManagerApi({
          token: authController.token,
          oldManagerId: oldManager.id,
          newManagerId: newManager.id,
        });
        if (changeManagerResponse.data !== null) {
          await actionAfterChange();
          setAnchorElState(null);
          showSnackbar(snackbarDispatch, {
            typeSnackbar: SUCCESS_TYPE,
            messageSnackbar: UPDATE_SUCCESS,
          });
        } else if (changeManagerResponse.fieldError) {
          switch (changeManagerResponse.fieldError) {
            case MANAGER_ID_FIELD:
              setError(changeManagerResponse.messageError);
              break;
            default:
              showSnackbar(snackbarDispatch, {
                typeSnackbar: ERROR_TYPE,
                messageSnackbar: changeManagerResponse.messageError,
              });
          }
        } else {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: ERROR_TYPE,
            messageSnackbar: changeManagerResponse.messageError,
          });
        }
      }
    }
  };

  // Convert AreaEmployee array to string to update
  const convertAreaEmployee = (areaEmployees: AreaEmployee[]) => {
    let result = "";
    areaEmployees.forEach((item: AreaEmployee) => {
      if (
        item.timeStart === null ||
        item.timeEnd === null ||
        item.areaRestriction === null ||
        item.timeStart.toLocaleString() === "Invalid Date" ||
        item.timeEnd.toLocaleString() === "Invalid Date"
      ) {
        return;
      }

      const { areaRestriction } = item;
      if (areaRestriction !== null) {
        result += `{"area_restriction_id":${areaRestriction.id},"time_start":"${item.timeStart}","time_end":"${item.timeEnd}"},`;
      }
    });
    if (result.length > 1) {
      result = `[${result.substring(0, result.length - 1)}]`;
    }
    return result;
  };

  const convertEmployeeName = () => {
    let employeeName = "";
    if (manager?.employees[0]?.name) {
      employeeName = manager?.employees[0]?.name;
    }
    return employeeName;
  };

  const renderChangeManagerForm = (): React.ReactElement => (
    <Popper
      // @ts-ignore
      anchorEl={anchorElState}
      // @ts-ignore
      anchorReference={null}
      open={anchorEl !== null}
      placement="bottom-start"
      style={{
        backgroundColor: "white",
        boxShadow: "0px 0px 12px 0px #000000",
        padding: "8px",
        borderRadius: "8px",
      }}
      onClick={(event: any) => {
        event.stopPropagation();
      }}
    >
      <MDBox display="flex" style={{ marginTop: "16px" }}>
        <EmployeeAutocomplete
          defaultData={newManager ? Array.of(newManager) : null}
          type="autocomplete"
          label="Người quản lý"
          handleChoose={(employees) => {
            setError("");
            if (employees.length > 0) {
              setNewManager(employees[0]);
            } else setNewManager(null);
          }}
          status="active"
          error={error}
        />
        <MDButton
          variant="gradient"
          color="info"
          fullWidth
          onClick={async (event: any) => {
            event.stopPropagation();
            showLoading(snackbarDispatch);
            await submitChangeManager();
            hideLoading(snackbarDispatch);
            setNewManager(null);
          }}
          sx={{ marginLeft: "8px", height: "52px" }}
          disabled={newManager === null}
        >
          Xác nhận
        </MDButton>
      </MDBox>
    </Popper>
  );

  return renderChangeManagerForm();
}
