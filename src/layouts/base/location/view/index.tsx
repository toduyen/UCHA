import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import FormInfo from "components/customizes/Form/FormInfo";
import { Location } from "models/base/location";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_LONG_LENGTH_LOCATION } from "../../../../constants/app";

function ViewUser({ handleClose, location }: { handleClose: any; location: Location }) {
  return (
    <FormInfo title="Thông tin chi nhánh" handleClose={handleClose} enableUpdate={false}>
      <MDBox display="flex" flexDirection="column">
        <MDBox display="flex" flexDirection="column" lineHeight="28px">
          <MDTypography variant="text" color="text" fontSize="14px">
            Tên chi nhánh:&nbsp;
            {convertEllipsisCharacter(location.name, STRING_LONG_LENGTH_LOCATION)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Mã chi nhánh:&nbsp;
            {convertEllipsisCharacter(location.code, STRING_LONG_LENGTH_LOCATION)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Số nhân sự: {location.numberEmployee}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Số camera: {location.numberCamera}
          </MDTypography>
        </MDBox>
      </MDBox>
    </FormInfo>
  );
}

export default ViewUser;
