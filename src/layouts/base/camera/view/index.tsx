import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import FormInfo from "components/customizes/Form/FormInfo";
import { Camera } from "models/base/camera";
import { isTimeKeepingModule } from "../../../../utils/checkRoles";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_LONG_LENGTH_CAMERA, STRING_SHORT_LENGTH } from "../../../../constants/app";

function ViewCamera({ handleClose, camera }: { handleClose: any; camera: Camera }) {
  return (
    <FormInfo title="Thông tin camera" handleClose={handleClose} enableUpdate={false}>
      <MDBox display="flex" flexDirection="column">
        <MDBox display="flex" flexDirection="column" lineHeight="28px">
          <MDTypography variant="text" color="text" fontSize="14px">
            Tên camera:&nbsp;{convertEllipsisCharacter(camera.name, STRING_LONG_LENGTH_CAMERA)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            {isTimeKeepingModule() ? (
              <>
                Chi nhánh:&nbsp;
                {camera.location
                  ? convertEllipsisCharacter(camera.location.name, STRING_SHORT_LENGTH)
                  : "không có"}
              </>
            ) : (
              <>
                Khu vực hạn chế:&nbsp;
                {camera.areaRestriction
                  ? convertEllipsisCharacter(camera.areaRestriction.areaName, STRING_SHORT_LENGTH)
                  : "không có"}
              </>
            )}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Link camera:&nbsp;
            {convertEllipsisCharacter(camera.ipAddress, STRING_LONG_LENGTH_CAMERA)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Loại camera:&nbsp;{convertEllipsisCharacter(camera.type, STRING_LONG_LENGTH_CAMERA)}
          </MDTypography>
        </MDBox>
      </MDBox>
    </FormInfo>
  );
}

export default ViewCamera;
