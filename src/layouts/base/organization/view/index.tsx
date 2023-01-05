import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import FormInfo from "components/customizes/Form/FormInfo";
import { Organization } from "models/base/organization";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_LONG_INFO_ORGANIZATION } from "../../../../constants/app";

function ViewOrganization({
  handleClose,
  organization,
}: {
  handleClose: any;
  organization: Organization;
}) {
  return (
    <FormInfo title="Thông tin tổ chức" handleClose={handleClose} enableUpdate={false}>
      <MDBox display="flex" flexDirection="column">
        <MDBox display="flex" flexDirection="column" lineHeight="28px">
          <MDTypography variant="text" color="text" fontSize="14px">
            Tên tổ chức:{" "}
            {convertEllipsisCharacter(organization?.name, STRING_LONG_INFO_ORGANIZATION)}
          </MDTypography>
          {organization.email && (
            <MDTypography variant="text" color="text" fontSize="14px">
              Email: {convertEllipsisCharacter(organization?.email, STRING_LONG_INFO_ORGANIZATION)}
            </MDTypography>
          )}
          {organization.phone && (
            <MDTypography variant="text" color="text" fontSize="14px">
              Số điện thoại: {organization.phone}
            </MDTypography>
          )}
          {organization.description && (
            <MDTypography variant="text" color="text" fontSize="14px">
              Mô tả:{" "}
              {convertEllipsisCharacter(organization?.description, STRING_LONG_INFO_ORGANIZATION)}
            </MDTypography>
          )}
          <MDTypography variant="text" color="text" fontSize="14px">
            Tổng số tài khoản: {organization.numberUser ? organization.numberUser : "0"}
          </MDTypography>
        </MDBox>
      </MDBox>
    </FormInfo>
  );
}

export default ViewOrganization;
