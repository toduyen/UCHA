import React from "react";
import logTableData from "./data";
import BasePage from "../basePage";
import FilterFormLogList from "./components/FilterForm";
import { LOG_TABLE_TITLE } from "../../../constants/app";

function LogList(): React.ReactElement {
  return (
    <BasePage
      tableTitle={LOG_TABLE_TITLE}
      tableData={logTableData}
      FilterForm={FilterFormLogList}
      optionFeature={{
        enableCreate: false,
        enableImport: false,
        enableExport: false,
      }}
    />
  );
}

export default LogList;
