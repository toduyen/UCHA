import MDBox from "components/bases/MDBox";
import Icon from "@mui/material/Icon";
import React, { useEffect, useState } from "react";
import { Popper } from "@mui/material";
import MDButton from "components/bases/MDButton";
import { Employee } from "models/base/employee";
import {
  updateFilterNotificationHistory,
  useNotificationHistoryController,
} from "context/notificationHistoryContext";
import EmployeeAutocomplete from "layouts/base/employees/components/EmployeeAutocomplete";
import FilterItem from "components/customizes/FilterItem";
import { hideLoading, showLoading, useSnackbarController } from "context/snackbarContext";
import FocusTrap from "focus-trap-react";

export default function FilterFormTimeKeeping(pageSize: number) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [employeeChooses, setEmployeeChooses] = useState<Array<Employee>>([]);
  const [employeeConfirm, setEmployeeConfirm] = useState<Employee | null>(null);

  // @ts-ignore
  const [, notificationHistoryDispatch] = useNotificationHistoryController();

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const submitChangeManager = (newEmployeeChooses: Array<Employee>) => {
    if (newEmployeeChooses.length > 0) {
      updateFilterNotificationHistory(notificationHistoryDispatch, {
        employee: newEmployeeChooses[0],
        pageSize,
      });
      setEmployeeConfirm(newEmployeeChooses[0]);
    } else {
      updateFilterNotificationHistory(notificationHistoryDispatch, { employee: null, pageSize });
      setEmployeeConfirm(null);
    }
    handleCloseMenu();
  };

  useEffect(() => {
    if (employeeConfirm === null) {
      setEmployeeChooses([]);
    }
  }, [employeeConfirm]);

  // Close popper when click outside
  const [isOpen, setIsOpen] = useState(true);
  const onFocusTrapDeactivate = () => {
    setIsOpen(false);
    setAnchorEl(null);
    setIsOpen(true);
  };

  const renderChangeManagerForm = (): React.ReactElement => (
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
        <MDBox display="flex" style={{ marginTop: "16px" }}>
          <EmployeeAutocomplete
            type="autocomplete"
            label="Danh s??ch nh??n s???"
            handleChoose={(newEmployeeChooses) => {
              setEmployeeChooses(newEmployeeChooses);
            }}
            defaultData={employeeChooses}
          />
          <MDButton
            variant="gradient"
            color="info"
            fullWidth
            onClick={(event: any) => {
              event.stopPropagation();
              showLoading(snackbarDispatch);
              submitChangeManager(employeeChooses);
              hideLoading(snackbarDispatch);
            }}
            sx={{ marginLeft: "8px", marginBottom: "16px" }}
          >
            X??c nh???n
          </MDButton>
        </MDBox>
      </FocusTrap>
    </Popper>
  );

  return (
    <MDBox display="flex" gap="10px" style={{ marginLeft: "10px", alignItems: "center" }}>
      {employeeConfirm && (
        <FilterItem
          value={`${employeeConfirm.code}-${employeeConfirm.name}`}
          handleClose={() => {
            submitChangeManager([]);
          }}
        />
      )}
      <Icon
        fontSize="small"
        style={{ cursor: "pointer" }}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          setEmployeeChooses(employeeConfirm ? [employeeConfirm] : []);
          setAnchorEl(anchorEl ? null : event.currentTarget);
        }}
      >
        filter_list
      </Icon>
      {renderChangeManagerForm()}
    </MDBox>
  );
}
