import { DASHBOARD_STATUS_TOUR } from "../../../../constants/app";

export const Getter = () => JSON.parse(localStorage.getItem(DASHBOARD_STATUS_TOUR) || "{}");
