import MDBox from "../../bases/MDBox";

import MDAlertCloseIcon from "components/bases/MDAlert/MDAlertCloseIcon";
import convertEllipsisCharacter from "../ConvertEllipsisCharacter";
import {
  STRING_LONG_LENGTH,
  STRING_LONG_LENGTH_FILTER,
  STRING_SHORT_LENGTH,
  STRING_SHORT_LENGTH_FILTER,
} from "../../../constants/app";

export default function FilterItem({
  value,
  handleClose,
  type,
}: {
  value: string;
  handleClose: () => void;
  type?: string;
}) {
  const renderValueFilter = () => {
    switch (type) {
      case "areaRestrictionConfirm":
        return convertEllipsisCharacter(value, STRING_SHORT_LENGTH_FILTER);
      case "cameraConfirm":
        return convertEllipsisCharacter(value, STRING_SHORT_LENGTH_FILTER);
      default:
        return convertEllipsisCharacter(value, STRING_LONG_LENGTH_FILTER);
    }
  };
  return (
    <MDBox
      borderRadius="20px"
      px={1}
      my={1}
      style={{
        backgroundColor: "#4F4F52",
        color: "white",
        fontSize: "0.875rem",
        padding: "10px",
        display: "flex",
      }}
    >
      {renderValueFilter()}
      <MDAlertCloseIcon onClick={handleClose} style={{ marginLeft: "10px" }}>
        &times;
      </MDAlertCloseIcon>
    </MDBox>
  );
}
