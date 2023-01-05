import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import MDBox from "../../bases/MDBox";
import typography from "../../../assets/theme/base/typography";
import MDButton from "../../bases/MDButton";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function RowAction({
  handleView,
  handleEdit,
  handleDelete,
  handleReSendCode,
}: {
  handleView: any;
  handleEdit: any;
  handleDelete: any;
  handleReSendCode?: any;
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const handleOpenRowAction = (event: any) => {
    event.stopPropagation();
    setOpenMenu(event.currentTarget);
  };
  const handleCloseMenu = () => setOpenMenu(false);
  const { size } = typography;

  const renderRowAction = () => (
    <Menu
      // @ts-ignore
      anchorEl={openMenu}
      // @ts-ignore
      anchorReference={null}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 1, ml: 1 }}
    >
      <MDBox display="flex" flexDirection="column" alignItems="center">
        <MDButton
          variant="text"
          onClick={() => {
            handleView();
            handleCloseMenu();
          }}
        >
          <MDBox display="flex" alignSelf="center" color="info">
            <RemoveRedEyeIcon />
            &nbsp;xem
          </MDBox>
        </MDButton>
        <MDButton
          variant="text"
          onClick={() => {
            handleEdit();
            handleCloseMenu();
          }}
        >
          <MDBox display="flex" alignSelf="center" color="dark">
            <Icon>edit</Icon>&nbsp;sửa
          </MDBox>
        </MDButton>
        <MDButton
          variant="text"
          onClick={() => {
            handleDelete();
            handleCloseMenu();
          }}
        >
          <MDBox display="flex" alignSelf="center" color="error">
            <Icon>delete</Icon>&nbsp;xóa
          </MDBox>
        </MDButton>
        {handleReSendCode ? (
          <MDBox mr={1}>
            <MDButton
              variant="text"
              color="success"
              onClick={(e: any) => {
                e.stopPropagation();
                handleReSendCode();
                handleCloseMenu();
              }}
            >
              <Icon>schedule_send</Icon>&nbsp;gửi lại mã
            </MDButton>
          </MDBox>
        ) : (
          <div />
        )}
      </MDBox>
    </Menu>
  );
  return (
    <MDBox marginLeft={size.xl}>
      <MoreVertIcon
        color="inherit"
        fontSize="medium"
        onClick={handleOpenRowAction}
        style={{ cursor: "pointer" }}
      />
      {renderRowAction()}
    </MDBox>
  );
}

export default RowAction;
