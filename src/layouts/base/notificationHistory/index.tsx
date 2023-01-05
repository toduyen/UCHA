import React from "react";
import BasePage from "layouts/base/basePage";
import notificationHistoryTableData from "./data";
import { FilterFormAreaRestriction } from "./component/FilterFormAreaRestriction";
import { isTimeKeepingModule } from "utils/checkRoles";
import FilterFormTimeKeeping from "./component/FilterFormTimeKeeping";
import { NOTIFICATION_HISTORIES_TABLE_TITLE } from "../../../constants/app";

function NotificationHistory(): React.ReactElement {
  return (
    <BasePage
      tableTitle={NOTIFICATION_HISTORIES_TABLE_TITLE}
      tableData={notificationHistoryTableData}
      FilterForm={isTimeKeepingModule() ? FilterFormTimeKeeping : FilterFormAreaRestriction}
      optionFeature={{
        enableCreate: false,
        enableImport: false,
        enableExport: false,
        enableSearch: false,
      }}
    />
  );
}

export default NotificationHistory;
