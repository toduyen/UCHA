import { Autocomplete, Icon, Popper, TextField } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDButton from "components/bases/MDButton";
import FilterItem from "components/customizes/FilterItem";
import { updateFilterEmployee, useEmployeeController } from "context/employeeContext";
import { hideLoading, showLoading, useSnackbarController } from "context/snackbarContext";
import React, { useEffect, useState } from "react";
import EmployeeAutocomplete from "./EmployeeAutocomplete";
import { Employee } from "../../../../models/base/employee";
import { Shift } from "../../../../models/time-keeping/shift";
import { EmployeeFilterType } from "../../../../types/filterType";
import ShiftAutoComplete from "./ShiftAutoComplete";
import { isTimeKeepingModule } from "../../../../utils/checkRoles";
import FocusTrap from "focus-trap-react";

export function FilterForm(pageSize: number, search: string) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusChoose, setStatusChoose] = useState<string | null>(null);
  const [managerChoose, setManagerChoose] = useState<Employee | null>(null);
  const [shiftsChoose, setShiftsChoose] = useState<Array<Shift> | null | undefined>(null);

  // @ts-ignore
  const [employeeController, employeeDispatch] = useEmployeeController();

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const [employeeStatusConfirm, setEmployeeStatusConfirm] = useState<string | null>(
    employeeController.filter.status
  );
  const [managerFilterConfirm, setManagerFilterConfirm] = useState<Employee | null>(
    employeeController.filter.manager
  );
  const [shiftsFilterConfirm, setShiftsFilterConfirm] = useState<Array<Shift> | null | undefined>(
    employeeController.filter.shifts
  );

  const getOptionTypeStatus = () => ["Đang hoạt động", "Đã xóa"];

  const handleCloseMenu = () => {
    // reset default value when click cancel button, update value when click accept button
    setStatusChoose(employeeStatusConfirm ? employeeStatusConfirm : "");
    setManagerChoose(managerFilterConfirm ? managerFilterConfirm : null);
    setShiftsChoose(shiftsFilterConfirm ? shiftsFilterConfirm : null);
    setAnchorEl(null);
  };

  const submitChange = ({
    status,
    manager,
    shifts,
  }: {
    status: string | null;
    manager: Employee | null;
    shifts?: Array<Shift> | null;
  }) => {
    const filter: EmployeeFilterType = {
      status,
      manager,
      shifts,
      pageSize: 10,
      search: "",
    };

    setEmployeeStatusConfirm(status);
    setManagerFilterConfirm(manager);
    setShiftsFilterConfirm(shifts);
    updateFilterEmployee(employeeDispatch, filter);
    setAnchorEl(null);
  };

  useEffect(() => {
    if (employeeStatusConfirm === null) {
      setStatusChoose(null);
    }
    if (managerFilterConfirm === null) {
      setManagerChoose(null);
    }
    if (shiftsFilterConfirm === null) {
      setShiftsChoose(null);
    }
  }, [employeeStatusConfirm, managerFilterConfirm, shiftsFilterConfirm]);

  // Close popper when click outside
  const [isOpen, setIsOpen] = useState(true);
  const onFocusTrapDeactivate = () => {
    setIsOpen(false);
    setAnchorEl(null);
    setIsOpen(true);
  };

  const renderChangeStatusEmployeeForm = (): React.ReactElement => (
    <Popper
      // @ts-ignore
      anchorEl={anchorEl}
      // @ts-ignore
      anchorReference={null}
      placement="bottom-start"
      open={Boolean(anchorEl)}
      onClose={handleCloseMenu}
      style={{
        backgroundColor: "white",
        boxShadow: "0px 0px 12px 0px #000000",
        padding: "8px",
        borderRadius: "8px",
      }}
    >
      {/* @ts-ignore */}
      <FocusTrap
        active={isOpen}
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          onDeactivate: onFocusTrapDeactivate,
        }}
      >
        <MDBox display="block" style={{ marginTop: "16px" }}>
          <EmployeeAutocomplete
            defaultData={managerChoose ? Array.of(managerChoose) : null}
            type="autocomplete"
            label="Người quản lý"
            handleChoose={(employees) => {
              if (employees.length > 0) {
                setManagerChoose(employees[0]);
              } else setManagerChoose(null);
            }}
            status="active"
          />
          {isTimeKeepingModule() && (
            <ShiftAutoComplete
              // @ts-ignore
              defaultData={shiftsChoose ? shiftsChoose : null}
              label="Ca làm việc"
              handleChoose={(shifts: Array<Shift>) => {
                if (shifts.length > 0) {
                  setShiftsChoose(shifts);
                } else setShiftsChoose(null);
              }}
            />
          )}
          <Autocomplete
            value={statusChoose}
            key="fields_status"
            onChange={(event, newOptions) => setStatusChoose(newOptions)}
            disablePortal
            id="autocomplete_status"
            options={getOptionTypeStatus()}
            renderInput={(params) => <TextField {...params} label="Trạng thái" />}
            ListboxProps={{ style: { maxHeight: "15rem" } }}
            onKeyDown={(event) => {
              if (event.code !== "Tab") {
                event.preventDefault();
              }
            }}
            filterOptions={(optionsFilter: any) => optionsFilter}
          />
          <MDBox mt={1} mb={1} display="flex">
            <MDButton
              variant="gradient"
              color="info"
              fullWidth
              onClick={(event: any) => {
                event.stopPropagation();
                showLoading(snackbarDispatch);
                submitChange({
                  status: statusChoose,
                  manager: managerChoose,
                  shifts: shiftsChoose,
                });
                hideLoading(snackbarDispatch);
              }}
            >
              Xác nhận
            </MDButton>
            <MDBox sx={{ width: "30px" }} />
            <MDButton variant="gradient" color="error" fullWidth onClick={handleCloseMenu}>
              Hủy bỏ
            </MDButton>
          </MDBox>
        </MDBox>
      </FocusTrap>
    </Popper>
  );

  useEffect(() => {
    if (employeeController.filter.status === null) {
      setEmployeeStatusConfirm("");
    } else {
      setEmployeeStatusConfirm(employeeController.filter.status);
    }
  }, [employeeController.filter.status]);

  return (
    <MDBox display="flex" gap="10px" style={{ marginLeft: "10px", alignItems: "center" }}>
      {employeeStatusConfirm && (
        <FilterItem
          value={`${employeeStatusConfirm}`}
          handleClose={() => {
            submitChange({
              status: null,
              manager: managerFilterConfirm,
              shifts: shiftsFilterConfirm,
            });
          }}
        />
      )}
      {managerFilterConfirm && (
        <FilterItem
          value={`${managerFilterConfirm.code}-${managerFilterConfirm.name}`}
          handleClose={() => {
            submitChange({ status: statusChoose, manager: null, shifts: shiftsFilterConfirm });
          }}
        />
      )}
      {shiftsFilterConfirm && (
        <FilterItem
          value={`${shiftsFilterConfirm.map((item) => item.name).join(", ")}`}
          handleClose={() => {
            submitChange({ status: statusChoose, manager: managerFilterConfirm, shifts: null });
          }}
        />
      )}
      <Icon
        fontSize="small"
        style={{ cursor: "pointer" }}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          handleCloseMenu();
          setAnchorEl(anchorEl ? null : event.currentTarget);
        }}
      >
        filter_list
      </Icon>
      {renderChangeStatusEmployeeForm()}
    </MDBox>
  );
}
