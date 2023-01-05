import { Autocomplete, Icon, Popper, TextField } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDButton from "components/bases/MDButton";
import FilterItem from "components/customizes/FilterItem";
import { updateFilterCamera, useCameraController } from "context/cameraContext";
import { hideLoading, showLoading, useSnackbarController } from "context/snackbarContext";
import AreaRestrictionAutocomplete from "layouts/area-restriction/areaRestriction/components/AreaRestrictionAutocomplete";
import { AreaRestriction } from "models/area-restriction/areaRestriction";
import React, { useEffect, useState } from "react";
import FocusTrap from "focus-trap-react";

export function FilterFormCameraAreaRestriction(pageSize: number, search: string) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [areaRestrictionChooses, setAreaRestrictionChooses] = useState<Array<AreaRestriction>>([]);
  const [areaRestrictionConfirm, setAreaRestrictionConfirm] = useState<AreaRestriction | null>(
    null
  );
  const [cameraStatusChooses, setCameraStatusChooses] = useState<string | null>(null);

  // @ts-ignore
  const [cameraController, cameraDispatch] = useCameraController();

  const [cameraStatusConfirm, setCameraStatusConfirm] = useState<string | null>(
    cameraController.filter.status
  );

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const handleCloseMenu = () => {
    // reset default value when click cancel button, update value when click accept button
    setCameraStatusChooses(cameraStatusConfirm ? cameraStatusConfirm : null);
    setAreaRestrictionChooses(areaRestrictionConfirm ? [areaRestrictionConfirm] : []);
    setAnchorEl(null);
  };

  const getOptionTypeStatus = () => ["Đang hoạt động", "Đã xóa"];
  const submitChange = (
    newAreaRestrictionChooses: Array<AreaRestriction | null>,
    statusChoosed: string | null
  ) => {
    let filter: {
      areaRestriction: AreaRestriction | null;
      status: string | null;
      pageSize: number;
      search: string;
    } = {
      areaRestriction: null,
      status: null,
      pageSize: 10,
      search: "",
    };
    if (newAreaRestrictionChooses.length > 0) {
      setAreaRestrictionConfirm(newAreaRestrictionChooses[0]);
      filter = {
        ...filter,
        areaRestriction: newAreaRestrictionChooses[0],
        pageSize,
        search,
      };
    } else {
      setAreaRestrictionConfirm(null);
    }
    if (statusChoosed) {
      setCameraStatusConfirm(statusChoosed);
      filter = { ...filter, status: statusChoosed, pageSize, search };
    } else {
      setCameraStatusConfirm(null);
    }
    updateFilterCamera(cameraDispatch, filter);

    setAnchorEl(null);
  };

  // when remove result filter => text box filter remove
  useEffect(() => {
    if (cameraStatusConfirm === null) {
      setCameraStatusChooses(null);
    }
    if (areaRestrictionConfirm === null) {
      setAreaRestrictionChooses([]);
    }
  }, [cameraStatusConfirm, areaRestrictionConfirm]);

  useEffect(() => {
    if (cameraController.filter.status === null) {
      setCameraStatusConfirm("");
    } else {
      setCameraStatusConfirm(cameraController.filter.status);
    }
  }, [cameraStatusConfirm]);

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
          <AreaRestrictionAutocomplete
            type="autocomplete"
            label="Danh sách khu vực hạn chế"
            handleChoose={(newAreaRestrictionChooses) => {
              setAreaRestrictionChooses(newAreaRestrictionChooses);
            }}
            defaultData={areaRestrictionChooses}
          />
          <Autocomplete
            value={cameraStatusChooses}
            key="fields_status"
            onChange={(event, newOptions) => setCameraStatusChooses(newOptions)}
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
                submitChange(areaRestrictionChooses, cameraStatusChooses);
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
            submitChange([], cameraStatusConfirm);
          }}
        />
      )}
      {cameraStatusConfirm && (
        <FilterItem
          value={`${cameraStatusConfirm}`}
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
