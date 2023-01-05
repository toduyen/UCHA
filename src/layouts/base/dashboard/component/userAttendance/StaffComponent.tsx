import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import SimpleBlogCard from "components/customizes/Cards/SimpleBlogCard";
import React, { useEffect, useState } from "react";
import { UserAttendanceItemType } from "types/userAttendanceItemType";
import {
  updateUserAttendanceChoosed,
  useNotificationHistoryController,
} from "context/notificationHistoryContext";
import MDButton from "components/bases/MDButton";
import { Icon, Modal } from "@mui/material";
import OpenCamera from "./OpenCamera";
import convertEllipsisCharacter from "../../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_LONG_LENGTH } from "../../../../../constants/app";

export default function StaffComponent({
  item,
  children,
}: {
  item: UserAttendanceItemType;
  children?: React.ReactElement;
}) {
  const [isControlled, setIsControlled] = useState(item.isControlled);
  const [open, setOpen] = useState(false);

  const handleCloseVideo = () => {
    setOpen(false);
  };

  // @ts-ignore
  const [notificationHistoryController, dispatch] = useNotificationHistoryController();

  useEffect(() => {
    if (item.isControlled !== isControlled) {
      setIsControlled(item.isControlled);
    }
  }, [item]);

  const openViewCamera = (closeView: Function) => (
    <OpenCamera
      handleClose={closeView}
      cameraName={item.cameraName}
      cameraId={item.cameraId}
      cameraTaken={item.cameraTaken}
      polygons={item.polygons || "[]"}
    />
  );

  return (
    <MDBox mt={2} mb={5}>
      <SimpleBlogCard
        image={item.image}
        image2={item.employeeImage}
        title={
          <MDTypography>
            {item.employeeName === "Unknown" ? "Người lạ" : `Họ và tên: ${item.employeeName}`}
          </MDTypography>
        }
        description={
          <>
            <MDTypography color="inherit" fontSize={14} display="flex">
              Thời gian:&nbsp;
              {convertEllipsisCharacter(item.time.split(" ")[1], STRING_LONG_LENGTH)}
            </MDTypography>
            <MDTypography color="inherit" fontSize={14} display="flex">
              Ngày:&nbsp;{convertEllipsisCharacter(item.time.split(" ")[0], STRING_LONG_LENGTH)}
            </MDTypography>
            <MDTypography color="inherit" fontSize={14} display="flex">
              Loại cảnh báo:&nbsp;{convertEllipsisCharacter(item.type, STRING_LONG_LENGTH)}
            </MDTypography>
            <MDTypography color="inherit" fontSize={14} display="flex">
              Khu vực hạn chế:&nbsp;
              {/* @ts-ignore */}
              {convertEllipsisCharacter(item.areaRestrictionName, STRING_LONG_LENGTH)}
            </MDTypography>
            <MDTypography color="inherit" fontSize={14} display="flex">
              Camera:&nbsp;{convertEllipsisCharacter(item.cameraName, STRING_LONG_LENGTH)}
            </MDTypography>
            <MDTypography color="inherit" fontSize={14} display="flex">
              <MDButton
                variant="text"
                color="success"
                style={{ padding: 0 }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
              >
                <Icon>videocam</Icon> Xem camera
              </MDButton>
            </MDTypography>
            <MDTypography color="inherit" fontSize={14}>
              Tình trạng: {isControlled ? "Đã xử lý" : "Chưa xử lý"}
            </MDTypography>
          </>
        }
        handleClick={() => {
          updateUserAttendanceChoosed(dispatch, item);
        }}
        customeStyle={{ border: isControlled ? "none" : "2px solid red", margin: "8px" }}
      >
        {children}
      </SimpleBlogCard>

      <Modal
        open={open}
        onClose={handleCloseVideo}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>{openViewCamera(handleCloseVideo)}</>
      </Modal>
    </MDBox>
  );
}
