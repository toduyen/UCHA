import React from "react";
import featuresTableData from "./data";
import BasePage from "../basePage";
import { FEATURE_TABLE_TITLE } from "../../../constants/app";

function Features(): React.ReactElement {
  return (
    <BasePage
      tableTitle={FEATURE_TABLE_TITLE}
      tableData={featuresTableData}
      optionFeature={{
        enableCreate: false,
        enableImport: false,
        enableExport: false,
      }}
    />
  );
}

export default Features;
