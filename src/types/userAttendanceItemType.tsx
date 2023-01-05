import { NotificationHistory } from "models/base/notificationHistory";
import { convertStringTime } from "utils/helpers";

export type UserAttendanceItemType = {
  locationId: number;
  employeeName: string;
  time: string;
  image: string;
  areaRestrictionName: string | undefined;
  areaRestrictionCode: string | undefined;
  areRestrictionId: number | undefined;
  cameraName: string;
  cameraTaken: string;
  cameraId: number;
  polygons: string | undefined;
  employeeImage: string;
  type: string;
  usingScreen: boolean | undefined;
  usingRing: boolean | undefined;
  notificationHistoryId: number;
  isControlled: boolean;
};

export const convertNotificationHistoryToUserAttendanceItem = (
  history: NotificationHistory,
  locationId: number
): UserAttendanceItemType => ({
  locationId,
  employeeName: history.employee ? history.employee.name : "Unknown",
  image: history.image ? history.image.path : "",
  time: convertStringTime(history.time),
  areaRestrictionName: history.camera ? history.camera.areaRestriction?.areaName : "",
  areaRestrictionCode: history.camera ? history.camera.areaRestriction?.areaCode : "",
  areRestrictionId: history.camera ? history.camera.areaRestriction?.id : 0,
  cameraName: history.camera ? history.camera.name : "",
  cameraTaken: history.camera ? history.camera.taken : "",
  cameraId: history.camera ? history.camera.id : 0,
  polygons: history.camera ? history.camera.polygons : undefined,
  employeeImage: history.employee && history.employee.image ? history.employee.image.path : "",
  type: history.type,
  notificationHistoryId: history.id,
  isControlled: history.status === "Đã xử lý",
  usingScreen: history.notificationMethod?.useScreen,
  usingRing: history.notificationMethod?.useRing,
});
