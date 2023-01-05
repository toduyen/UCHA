import FormInfo from "components/customizes/Form/FormInfo";
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import { Employee } from "../../../../models/base/employee";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import {
  STRING_LONG_LENGTH_AREA_RESTRICTION,
  STRING_SHORT_LENGTH,
} from "../../../../constants/app";

function ViewAreaRestriction({
  handleClose,
  areaRestriction,
}: {
  handleClose: any;
  areaRestriction: any;
}) {
  return (
    <FormInfo title="Thông tin người dùng" handleClose={handleClose} enableUpdate={false}>
      <MDBox display="flex" flexDirection="column">
        <MDBox display="flex" flexDirection="column" lineHeight="28px">
          <MDTypography variant="text" color="text" fontSize="14px">
            Tên khu vực: &nbsp;
            {convertEllipsisCharacter(
              areaRestriction.areaName,
              STRING_LONG_LENGTH_AREA_RESTRICTION
            )}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Mã khu vực: &nbsp;
            {convertEllipsisCharacter(
              areaRestriction.areaCode,
              STRING_LONG_LENGTH_AREA_RESTRICTION
            )}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Số nhân sự được phép ra vào:{" "}
            {areaRestriction.personnelAllowedInOut ? areaRestriction.personnelAllowedInOut : 0}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px" display="flex">
            Nhân sự phụ trách:{" "}
            {areaRestriction.personnelInCharge?.map((item: Employee, index: number) => (
              <MDBox key={index} style={{ display: "flex" }}>
                {index > 0 && ", "}
                &nbsp;
                {convertEllipsisCharacter(item.name, STRING_SHORT_LENGTH)}
              </MDBox>
            ))}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Thời gian cho phép: {`${areaRestriction.timeStart} : ${areaRestriction.timeEnd}`}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Số camera: {areaRestriction.numberCamera ? areaRestriction.numberCamera : 0}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Số cảnh báo trong ngày:{" "}
            {areaRestriction.numberOfAlertsForTheDay ? areaRestriction.numberOfAlertsForTheDay : 0}
          </MDTypography>
        </MDBox>
      </MDBox>
    </FormInfo>
  );
}

export default ViewAreaRestriction;
