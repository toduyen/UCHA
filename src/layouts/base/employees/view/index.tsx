import FormInfo from "components/customizes/Form/FormInfo";
import { Employee } from "models/base/employee";
import MDAvatar from "components/bases/MDAvatar";
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import { Shift } from "../../../../models/time-keeping/shift";
import { useEmployeeController } from "../../../../context/employeeContext";
import { isTimeKeepingModule } from "utils/checkRoles";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_LONG_LENGTH_EMPLOYEES } from "../../../../constants/app";

function ViewEmployee({ handleClose, employee }: { handleClose: any; employee: Employee }) {
  // @ts-ignore
  const [employeeController] = useEmployeeController();
  const fullAttrEmployee = employeeController.employees.filter(
    (item: Employee) => item.id === employee.id
  )[0];
  return (
    <FormInfo title="Thông tin nhân viên" handleClose={handleClose} enableUpdate={false}>
      <MDBox display="flex" flexDirection="column">
        <MDBox display="flex" justifyContent="center" paddingBottom="41px">
          <MDAvatar
            src={fullAttrEmployee.image ? fullAttrEmployee.image.path : ""}
            alt={fullAttrEmployee.name}
            size="xxl"
            shadow="md"
          />
        </MDBox>
        <MDBox display="flex" flexDirection="column" lineHeight="28px">
          <MDTypography variant="text" color="text" fontSize="14px">
            Họ và tên: &nbsp;
            {convertEllipsisCharacter(fullAttrEmployee.name, STRING_LONG_LENGTH_EMPLOYEES)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Mã nhân viên:&nbsp;
            {convertEllipsisCharacter(fullAttrEmployee.code, STRING_LONG_LENGTH_EMPLOYEES)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Email: &nbsp;
            {convertEllipsisCharacter(fullAttrEmployee.email, STRING_LONG_LENGTH_EMPLOYEES)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Số điện thoại: {fullAttrEmployee.phone}
          </MDTypography>
          {isTimeKeepingModule() ? (
            <MDTypography variant="text" color="text" fontSize="14px">
              Ca làm việc:{" "}
              {fullAttrEmployee.shifts.map((shift: Shift) => `${shift.name}`).join(", ")}
            </MDTypography>
          ) : (
            <div />
          )}
          <MDTypography variant="text" color="text" fontSize="14px">
            Người quản lý:
            {fullAttrEmployee.manager
              ? ` ${fullAttrEmployee.manager.code}-${fullAttrEmployee.manager.name}`
              : ""}
          </MDTypography>
        </MDBox>
      </MDBox>
    </FormInfo>
  );
}

export default ViewEmployee;
