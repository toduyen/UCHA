import { Grid } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import { useEffect, useState } from "react";
import { AreaRestriction } from "models/area-restriction/areaRestriction";
import { Employee } from "../../../../../models/base/employee";
import ManagerTimeSkipItem from "./ManagerTimeSkipItem";
import { AreaSettingReportType } from "types/areaSetingReport";
import {
  EMPLOYEE_IS_EMPTY,
  THE_TIME_ALLOWED,
  TIME_IS_EMPTY,
  TIME_IS_NOT_VALID,
} from "../../../../../constants/validate";
import { isValidTimeNotification } from "../../../../../utils/helpers";
import convertEllipsisCharacter from "../../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_LONG_LENGTH } from "../../../../../constants/app";

export default function AreaRestrictionManagerComponent({
  areaRestriction,
  rowsData,
  handleUpdateReport,
  conditionUpdate,
}: {
  areaRestriction: AreaRestriction;
  rowsData: any;
  handleUpdateReport: (index: number, newValue: AreaSettingReportType | null) => void;
  conditionUpdate: boolean;
}) {
  const [areaRestrictionManage, setAreaRestrictionManage] = useState<Array<Employee>>([]);
  const [rowDataState, setRowDataState] = useState(rowsData);

  const isValid = (time: any) => {
    let checkValid = true;
    if (!isValidTimeNotification(time)) {
      checkValid = false;
    }
    return checkValid;
  };

  useEffect(() => {
    if (areaRestriction) {
      setAreaRestrictionManage(areaRestriction.personnelInCharge);
    }
  }, [areaRestriction]);

  useEffect(() => {
    if (rowsData !== rowDataState) {
      setRowDataState(rowsData);
    }
  }, [rowsData]);

  const renderError = (item: any) => {
    if (item.timeReport === null || item.timeReport === "") {
      return (
        <MDBox color="#F44335" fontSize="13px" fontWeight="100" marginLeft="3px">
          {!conditionUpdate && TIME_IS_EMPTY}
        </MDBox>
      );
    }
    if (item?.staff === null) {
      return (
        <MDBox color="#F44335" fontSize="13px" fontWeight="100" marginLeft="3px">
          {!conditionUpdate && EMPLOYEE_IS_EMPTY}
        </MDBox>
      );
    }

    if (!isValid(item.timeReport)) {
      return (
        <MDBox color="#F44335" fontSize="13px" fontWeight="100" marginLeft="3px">
          {!conditionUpdate && TIME_IS_NOT_VALID}
        </MDBox>
      );
    }

    if (item.timeReport <= 0 || item.timeReport > 999) {
      return (
        <MDBox color="#F44335" fontSize="13px" fontWeight="100" marginLeft="3px">
          {!conditionUpdate && THE_TIME_ALLOWED}
        </MDBox>
      );
    }
    return null;
  };

  return (
    <MDBox>
      <Grid container mb={1}>
        <MDTypography fontSize={16} fontWeight="medium">
          Cảnh báo cho
        </MDTypography>
      </Grid>
      {areaRestrictionManage
        ? areaRestrictionManage.map((item, index) => (
            <Grid key={`${item.name}_${index}`} container mb={3} style={{ fontSize: "13px" }}>
              <Grid item xs={6} md={6} lg={6}>
                {convertEllipsisCharacter(item.name, STRING_LONG_LENGTH)}
              </Grid>
              <Grid item xs={6} md={6} lg={6}>
                Ngay lập tức
              </Grid>
            </Grid>
          ))
        : ""}
      {rowDataState.map((item: AreaSettingReportType, index: number) => (
        <>
          <ManagerTimeSkipItem
            key={`${index}`}
            handleUpdateReport={handleUpdateReport}
            position={index}
            item={item}
            totalNumber={rowDataState.length}
          />
          <MDBox>{renderError(item)}</MDBox>
        </>
      ))}
    </MDBox>
  );
}
