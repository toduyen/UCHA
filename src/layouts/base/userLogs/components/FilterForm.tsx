import MDBox from "components/bases/MDBox";
import Icon from "@mui/material/Icon";
import React, { useEffect, useState } from "react";
import { Popper } from "@mui/material";
import MDButton from "components/bases/MDButton";
import FilterItem from "components/customizes/FilterItem";
import { User } from "models/base/user";
import { updateFilterUserLog, useUserLogController } from "context/userLogContext";
import UserAutoComplete from "layouts/base/users/components/UserAutoComplete";
import { hideLoading, showLoading, useSnackbarController } from "context/snackbarContext";
import FocusTrap from "focus-trap-react";

export default function FilterFormLogList(pageSize: number, search: string) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountChooses, setAccountChooses] = useState<Array<User>>([]);
  const [accountConfirm, setAccountConfirm] = useState<User | null>(null);

  // @ts-ignore
  const [, userLogDispatch] = useUserLogController();

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const handleCloseMenu = () => {
    // reset default value when click cancel button, update value when click accept button
    setAccountChooses(accountConfirm ? [accountConfirm] : []);

    setAnchorEl(null);
  };
  const submitChangeManager = (newEmployeeChooses: Array<User>) => {
    if (newEmployeeChooses.length > 0) {
      updateFilterUserLog(userLogDispatch, {
        accountChoosed: newEmployeeChooses[0],
        pageSize,
        search,
      });
      setAccountConfirm(newEmployeeChooses[0]);
    } else {
      updateFilterUserLog(userLogDispatch, {
        accountChoosed: null,
        pageSize,
        search,
      });
      setAccountConfirm(null);
    }
    setAnchorEl(null);
  };

  useEffect(() => {
    if (accountConfirm === null) {
      setAccountChooses([]);
    }
  }, [accountConfirm]);

  // Close popper when click outside
  const [isOpen, setIsOpen] = useState(true);
  const onFocusTrapDeactivate = () => {
    setIsOpen(false);
    setAnchorEl(null);
    setIsOpen(true);
  };

  const renderChangeAccountForm = (): React.ReactElement => (
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
          <UserAutoComplete
            type="autocomplete"
            label="Danh sách tài khoản"
            handleChoose={(newEmployeeChooses) => {
              setAccountChooses(newEmployeeChooses);
            }}
            defaultData={accountChooses}
          />
          <MDBox mt={1} mb={1} display="flex">
            <MDButton
              variant="gradient"
              color="info"
              fullWidth
              onClick={(event: any) => {
                event.stopPropagation();
                showLoading(snackbarDispatch);
                submitChangeManager(accountChooses);
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
      {accountConfirm && (
        <FilterItem
          value={`${accountConfirm.id}-${accountConfirm.username}`}
          handleClose={() => {
            submitChangeManager([]);
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
      {renderChangeAccountForm()}
    </MDBox>
  );
}
