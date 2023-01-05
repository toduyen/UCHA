import { Autocomplete, Icon, Popper, TextField } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDButton from "components/bases/MDButton";
import FilterItem from "components/customizes/FilterItem";
import { hideLoading, showLoading, useSnackbarController } from "context/snackbarContext";
import { updateFilterUser, useUserController } from "context/userContext";
import React, { useEffect, useState } from "react";
import FocusTrap from "focus-trap-react";

export function FilterFormUser(pageSize: number, search: string) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userStatusChooses, setUserStatusChooses] = useState<string | null>(null);

  // @ts-ignore
  const [userController, userDispatch] = useUserController();

  const [userStatusConfirm, setUserStatusConfirm] = useState<string | null>(
    userController.filter.status
  );

  const getOptionTypeStatus = () => ["Đang hoạt động", "Đã xóa", "Đang chờ xác nhận"];

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const handleCloseMenu = () => {
    // reset default value when click cancel button, update value when click accept button
    setUserStatusChooses(userStatusConfirm ? userStatusConfirm : null);
    setAnchorEl(null);
  };

  const submitChange = (statusChoosed: string | null) => {
    let status = null;
    if (statusChoosed) {
      setUserStatusConfirm(statusChoosed);
      status = statusChoosed;
    } else {
      setUserStatusConfirm(null);
    }
    updateFilterUser(userDispatch, { status, pageSize, search });

    setAnchorEl(null);
  };

  useEffect(() => {
    if (userStatusConfirm === null && userStatusChooses) {
      setUserStatusChooses(null);
    }
  }, [userStatusConfirm]);

  // Close popper when click outside
  const [isOpen, setIsOpen] = useState(true);
  const onFocusTrapDeactivate = () => {
    setIsOpen(false);
    setAnchorEl(null);
    setIsOpen(true);
  };

  const renderChangeAreaRestrictionForm = (): React.ReactElement => (
    <Popper
      // @ts-ignore
      anchorEl={anchorEl}
      // @ts-ignore
      anchorReference={null}
      placement="bottom-start"
      open={Boolean(anchorEl)}
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
          <Autocomplete
            value={userStatusChooses}
            key="fields_status"
            onChange={(event, newOptions) => setUserStatusChooses(newOptions)}
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
                submitChange(userStatusChooses);
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

  return (
    <MDBox display="flex" gap="10px" style={{ marginLeft: "10px", alignItems: "center" }}>
      {userStatusConfirm && (
        <FilterItem
          value={`${userStatusConfirm}`}
          handleClose={() => {
            submitChange(null);
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
      {renderChangeAreaRestrictionForm()}
    </MDBox>
  );
}
