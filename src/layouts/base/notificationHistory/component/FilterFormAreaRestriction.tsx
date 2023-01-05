import { Autocomplete, Icon, Popper, TextField } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDButton from "components/bases/MDButton";
import FilterItem from "components/customizes/FilterItem";
import {
  updateFilterNotificationHistory,
  useNotificationHistoryController,
} from "context/notificationHistoryContext";
import { hideLoading, showLoading, useSnackbarController } from "context/snackbarContext";
import AreaRestrictionAutocomplete from "layouts/area-restriction/areaRestriction/components/AreaRestrictionAutocomplete";
import { AreaRestriction } from "models/area-restriction/areaRestriction";
import React, { useEffect, useState } from "react";
import FocusTrap from "focus-trap-react";

export function FilterFormAreaRestriction(pageSize: number) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [areaRestrictionChooses, setAreaRestrictionChooses] = useState<Array<AreaRestriction>>([]);
  const [areaRestrictionConfirm, setAreaRestrictionConfirm] = useState<AreaRestriction | null>(
    null
  );
  const [areaRestrictionStatusChooses, setAreaRestrictionStatusChooses] = useState<string | null>(
    null
  );

  // @ts-ignore
  const [notificationController, notificationHistoryDispatch] = useNotificationHistoryController();

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const [areaRestrictionStatusConfirm, setAreaRestrictionStatusConfirm] = useState<string | null>(
    notificationController.filter.status
  );
  const handleCloseMenu = () => {
    setAreaRestrictionChooses(areaRestrictionConfirm ? [areaRestrictionConfirm] : []);
    setAreaRestrictionStatusChooses(
      areaRestrictionStatusConfirm ? areaRestrictionStatusConfirm : null
    );
    setAnchorEl(null);
  };

  const getOptionTypeStatus = () => ["Đã xử lý", "Chưa xử lý"];

  const submitChange = (
    newAreaRestrictionChooses: Array<AreaRestriction | null>,
    areaRestrictionStatusChoosed: string | null
  ) => {
    let filter: {
      areaRestriction: AreaRestriction | null;
      status: string | null;
      pageSize: number;
    } = {
      areaRestriction: null,
      status: null,
      pageSize: 10,
    };
    if (newAreaRestrictionChooses.length > 0) {
      setAreaRestrictionConfirm(newAreaRestrictionChooses[0]);
      filter = {
        ...filter,
        areaRestriction: newAreaRestrictionChooses[0],
        pageSize,
      };
    } else {
      setAreaRestrictionConfirm(null);
    }
    if (areaRestrictionStatusChoosed) {
      setAreaRestrictionStatusConfirm(areaRestrictionStatusChoosed);
      filter.status = areaRestrictionStatusChoosed;
    } else {
      setAreaRestrictionStatusConfirm(null);
    }
    updateFilterNotificationHistory(notificationHistoryDispatch, filter);
    setAnchorEl(null);
  };

  useEffect(() => {
    // reset default value when click cancel button, update value when click accept button
    if (areaRestrictionChooses) {
      setAreaRestrictionChooses(areaRestrictionConfirm ? [areaRestrictionConfirm] : []);
    }
    if (areaRestrictionStatusChooses) {
      setAreaRestrictionStatusChooses(
        areaRestrictionStatusConfirm ? areaRestrictionStatusConfirm : null
      );
    }
  }, [areaRestrictionStatusConfirm, areaRestrictionConfirm]);

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
          <AreaRestrictionAutocomplete
            type="autocomplete"
            label="Danh sách khu vực hạn chế"
            handleChoose={(newAreaRestrictionChooses) => {
              setAreaRestrictionChooses(newAreaRestrictionChooses);
            }}
            defaultData={areaRestrictionChooses}
          />
          <Autocomplete
            value={areaRestrictionStatusChooses}
            key="fields_status"
            onChange={(event, newOptions) => setAreaRestrictionStatusChooses(newOptions)}
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
                submitChange(areaRestrictionChooses, areaRestrictionStatusChooses);
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
      {areaRestrictionConfirm && (
        <FilterItem
          value={`${areaRestrictionConfirm.areaCode}-${areaRestrictionConfirm.areaName}`}
          handleClose={() => {
            submitChange([], areaRestrictionStatusConfirm);
          }}
        />
      )}
      {areaRestrictionStatusConfirm && (
        <FilterItem
          value={`${areaRestrictionStatusConfirm}`}
          handleClose={() => {
            submitChange(Array.of(areaRestrictionConfirm), null);
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
