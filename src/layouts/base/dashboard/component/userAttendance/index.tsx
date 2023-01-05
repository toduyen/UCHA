import React, { useEffect, useState } from "react";
import MDBox from "components/bases/MDBox";
import StaffComponent from "./StaffComponent";
// @ts-ignore
import Pulse from "react-reveal/Pulse";
import {
  convertNotificationHistoryToUserAttendanceItem,
  UserAttendanceItemType,
} from "types/userAttendanceItemType";
import { TabPanel, TitleTabs } from "./TabPanel";
import { getAllNotificationHistoryFilterApi } from "../../../notificationHistory/api";
import { NotificationHistory } from "models/base/notificationHistory";
import { useAuthenController } from "context/authenContext";
import {
  getUserAttendanceItemsSuccess,
  useNotificationHistoryController,
} from "context/notificationHistoryContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { Autocomplete, CircularProgress, Popper, TextField } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDButton from "../../../../../components/bases/MDButton";
import CameraAutocomplete from "../../../camera/components/CameraAutocomplete";
import AreaRestrictionAutocomplete from "../../../../area-restriction/areaRestriction/components/AreaRestrictionAutocomplete";
import {
  hideLoading,
  showLoading,
  useSnackbarController,
} from "../../../../../context/snackbarContext";
import { Camera } from "../../../../../models/base/camera";
import { AreaRestriction } from "../../../../../models/area-restriction/areaRestriction";
import FilterItem from "../../../../../components/customizes/FilterItem";
import FocusTrap from "focus-trap-react";

export default function UserAttendance() {
  const [value, setValue] = React.useState(0);
  const [userAttendanceItems, setUserAttendanceItems] = useState<Array<UserAttendanceItemType>>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [areaRestrictionChooses, setAreaRestrictionChooses] = useState<Array<AreaRestriction>>([]);
  const [areaRestrictionConfirm, setAreaRestrictionConfirm] = useState<AreaRestriction | null>(
    null
  );
  const [cameraChooses, setCameraChooses] = useState<Array<Camera>>([]);
  const [cameraConfirm, setCameraConfirm] = useState<Camera | null>(null);
  const [statusChooses, setStatusChooses] = useState<string | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<string | null>(null);

  // @ts-ignore
  const [authController] = useAuthenController();

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  // @ts-ignore
  const [notificationHistoryController, notificationHistoryDispatch] =
    useNotificationHistoryController();

  // @ts-ignore
  useEffect(async () => {
    if (authController.token) {
      await getUserAttendanceItems(0, 10, null, true);
    }
  }, [authController.token]);

  useEffect(() => {
    if (notificationHistoryController.userAttendanceItems) {
      setUserAttendanceItems(notificationHistoryController.userAttendanceItems);
    }
  }, [notificationHistoryController.userAttendanceItems]);

  const getUserAttendanceItems = async (
    page: number,
    size: number,
    hasEmployee?: boolean | null,
    isFromStart?: boolean,
    areaRestrictionId?: number,
    cameraId?: number,
    statusFilter?: string | null
  ) => {
    const getNotificationHistoriesInCurrentDay = await getAllNotificationHistoryFilterApi({
      token: authController.token,
      page,
      size,
      // timeStart: convertStringFromDateTime(convertTimeStringToDate("00:00:00")),
      // timeEnd: convertStringFromDateTime(convertTimeStringToDate("23:59:59")),
      hasEmployee,
      areaRestrictionId,
      cameraId,
      status: statusFilter,
    });
    if (getNotificationHistoriesInCurrentDay.data !== null) {
      const dataInPage = getNotificationHistoriesInCurrentDay.data.data.map(
        (item: NotificationHistory) =>
          convertNotificationHistoryToUserAttendanceItem(
            item,
            authController.currentUser.location.id
          )
      );
      const newData = isFromStart
        ? dataInPage
        : [...notificationHistoryController.userAttendanceItems, ...dataInPage];
      getUserAttendanceItemsSuccess(notificationHistoryDispatch, newData);
      setTotalPage(getNotificationHistoriesInCurrentDay.data.pageCount);
    }
  };

  const handleChange = async (event: any, newValue: any) => {
    setValue(newValue);
    setCurrentPage(0);
    await getUserAttendanceItems(
      0,
      10,
      newValue === 0 ? null : newValue === 2,
      true,
      areaRestrictionConfirm ? areaRestrictionConfirm.id : undefined,
      cameraConfirm ? cameraConfirm.id : undefined,
      statusConfirm ? statusConfirm : ""
    );
  };

  const getTabPanelContent = () => (
    <div id="scrollableDiv" style={{ height: "52vh", overflowY: "auto", overflowX: "hidden" }}>
      <InfiniteScroll
        dataLength={userAttendanceItems.length}
        next={async () => {
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          await getUserAttendanceItems(
            newPage,
            10,
            value === 0 ? null : value === 2,
            false,
            areaRestrictionConfirm ? areaRestrictionConfirm.id : undefined,
            cameraConfirm ? cameraConfirm.id : undefined,
            statusConfirm ? statusConfirm : ""
          );
        }}
        hasMore={userAttendanceItems?.length > 0 && currentPage <= Math.abs(totalPage - 1)}
        loader={
          <MDBox style={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress color="info" />
          </MDBox>
        }
        scrollableTarget="scrollableDiv"
        style={{ overflow: "unset" }}
      >
        {userAttendanceItems.map((item: UserAttendanceItemType, index: number) =>
          !item.isControlled ? (
            <Pulse forever key={`${item.employeeName}_${item.time}_${index}`}>
              <StaffComponent item={item} />
            </Pulse>
          ) : (
            <StaffComponent item={item} key={`${item.employeeName}_${item.time}_${index}`} />
          )
        )}
      </InfiniteScroll>
    </div>
  );

  const submitChange = async (
    newAreaRestrictionChooses: Array<AreaRestriction | null>,
    newCameraChooses: Array<Camera | null>,
    statusChoosed: string | null
  ) => {
    const filter: {
      areaRestriction: AreaRestriction | null;
      camera: Camera | null;
      status: string | null;
    } = {
      areaRestriction: null,
      camera: null,
      status: null,
    };

    if (newAreaRestrictionChooses.length > 0) {
      setAreaRestrictionConfirm(newAreaRestrictionChooses[0]);
      // eslint-disable-next-line prefer-destructuring
      filter.areaRestriction = newAreaRestrictionChooses[0];
    } else {
      setAreaRestrictionConfirm(null);
    }
    if (newCameraChooses.length > 0) {
      setCameraConfirm(newCameraChooses[0]);
      // eslint-disable-next-line prefer-destructuring
      filter.camera = newCameraChooses[0];
    } else {
      setCameraConfirm(null);
    }
    if (statusChoosed) {
      setStatusConfirm(statusChoosed);
      filter.status = statusChoosed;
    } else {
      setStatusConfirm(null);
    }

    setAnchorEl(null);
    handleFilter(newAreaRestrictionChooses[0]?.id, newCameraChooses[0]?.id, statusChoosed);
  };
  // when remove result filter => text box filter remove
  useEffect(() => {
    if (statusConfirm === null) {
      setStatusChooses(null);
    }
    if (cameraConfirm === null) {
      setCameraChooses([]);
    }
    if (areaRestrictionConfirm === null) {
      setAreaRestrictionChooses([]);
    }
  }, [statusConfirm, cameraConfirm, areaRestrictionConfirm]);

  const handleFilter = async (
    areaRestrictionId: number | undefined,
    cameraId: number | undefined,
    statusChoosed: string | null
  ) => {
    // @ts-ignore
    await getUserAttendanceItems(
      0,
      10,
      value === 0 ? null : value === 2,
      true,
      areaRestrictionId,
      cameraId,
      statusChoosed
    );
  };

  const handleCloseMenu = () => {
    // reset default value when click cancel button, update value when click accept button

    setAreaRestrictionChooses(areaRestrictionConfirm ? [areaRestrictionConfirm] : []);
    setCameraChooses(cameraConfirm ? [cameraConfirm] : []);
    setStatusChooses(statusConfirm ? statusConfirm : null);
    setAnchorEl(null);
  };

  const getOptionTypeStatus = () => ["Chưa xử lý", "Đã xử lý"];

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
      style={{
        backgroundColor: "white",
        boxShadow: "0px 0px 12px 0px #000000",
        padding: "16px",
        borderRadius: "8px",
        zIndex: "12",
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
        <MDBox>
          <MDBox display="block">
            <CameraAutocomplete
              type="autocomplete"
              label="Camera"
              handleChoose={(cameras) => {
                setCameraChooses(cameras);
              }}
              defaultData={cameraChooses}
            />
            <AreaRestrictionAutocomplete
              type="autocomplete"
              label="Danh sách khu vực hạn chế"
              handleChoose={(newAreaRestrictionChooses) => {
                setAreaRestrictionChooses(newAreaRestrictionChooses);
              }}
              defaultData={areaRestrictionChooses}
            />
            <Autocomplete
              sx={{ minWidth: "250px" }}
              value={statusChooses}
              key="fields_status"
              onChange={(event, newOptions) => setStatusChooses(newOptions)}
              disablePortal
              id="autocomplete_status"
              options={getOptionTypeStatus()}
              renderInput={(params) => <TextField {...params} label="Tình trạng xử lý" />}
              onKeyDown={(event) => {
                if (event.code !== "Tab") {
                  event.preventDefault();
                }
              }}
              ListboxProps={{ style: { maxHeight: "15rem" } }}
            />
          </MDBox>
          <MDBox mt={1} mb={1} display="flex" sx={{ marginLeft: "8px" }}>
            <MDButton
              variant="gradient"
              color="info"
              fullWidth
              onClick={(event: any) => {
                event.stopPropagation();
                showLoading(snackbarDispatch);
                submitChange(areaRestrictionChooses, cameraChooses, statusChooses);
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
    <MDBox
      style={{ background: "DEE2E8", boxShadow: "0px 2px 6px rgb(0 0 0 / 25%)" }}
      data-tut="reactour__nine"
    >
      <MDBox style={{ display: "flex", justifyContent: "end", padding: "10px" }}>
        <MDBox display="flex" gap="10px" style={{ marginLeft: "10px", alignItems: "center" }}>
          {areaRestrictionConfirm && (
            <FilterItem
              value={`${areaRestrictionConfirm.areaCode}-${areaRestrictionConfirm.areaName}`}
              handleClose={() => {
                submitChange([], Array.of(cameraConfirm), statusConfirm);
              }}
              type="areaRestrictionConfirm"
            />
          )}
          {statusConfirm && (
            <FilterItem
              value={statusConfirm}
              handleClose={() => {
                submitChange(Array.of(areaRestrictionConfirm), Array.of(cameraConfirm), null);
              }}
            />
          )}
          {cameraConfirm && (
            <FilterItem
              value={cameraConfirm.name}
              handleClose={() => {
                submitChange(Array.of(areaRestrictionConfirm), [], statusConfirm);
              }}
              type="cameraConfirm"
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
          {renderChangeManagerForm()}
        </MDBox>
      </MDBox>
      <MDBox>
        <TitleTabs
          labelId="demo-a11y-tabs-automatic-label"
          selectionFollowsFocus
          onChange={handleChange}
          value={value}
        />
        <MDBox style={{ position: "sticky" }}>
          <TabPanel value={value} index={0}>
            {getTabPanelContent()}
          </TabPanel>
          <TabPanel value={value} index={1}>
            {getTabPanelContent()}
          </TabPanel>
          <TabPanel value={value} index={2}>
            {getTabPanelContent()}
          </TabPanel>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}
