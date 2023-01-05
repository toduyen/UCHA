import { DASHBOARD_STATUS_TOUR } from "../../../../constants/app";

export const Setter = (StatusDash: boolean, StatusCamera: boolean, StatusInOutHistory: boolean) =>
  localStorage.setItem(
    DASHBOARD_STATUS_TOUR,
    JSON.stringify({
      STATUS_DASHBOARD: StatusDash,
      STATUS_CAMERA: StatusCamera,
      STATUS_IN_OUT_HISTORY: StatusInOutHistory,
    })
  );
