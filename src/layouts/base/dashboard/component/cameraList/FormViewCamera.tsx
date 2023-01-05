import React from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import MDButton from "components/bases/MDButton";
import {
  CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE,
  CAMERA_LIST_ID_LOCAL_STORAGE,
} from "../../../../../constants/app";
// @ts-ignore
import { useCameraController } from "../../../../../context/cameraContext";
import FocusTrap from "focus-trap-react";

type Props = {
  title: string;
  handleClose?: Function;
  children?: React.ReactElement;
  handleSaveData?: Function;
};

function FormViewCamera({ title, handleClose, children, handleSaveData }: Props) {
  // @ts-ignore
  const [cameraListIdController] = useCameraController();
  const combineHandleClose = () => {
    localStorage.removeItem(
      CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE + localStorage.getItem("module")
    );
    if (cameraListIdController?.cameraListIdSave[0]?.length > 0) {
      localStorage.setItem(
        CAMERA_LIST_ID_LOCAL_STORAGE + localStorage.getItem("module"),
        JSON.stringify(cameraListIdController?.cameraListIdSave[0])
      );
    }
    if (cameraListIdController?.cameraListIdSave[0] === undefined) {
      localStorage.removeItem(CAMERA_LIST_ID_LOCAL_STORAGE + localStorage.getItem("module"));
    }
    // @ts-ignore
    handleClose();
  };
  return (
    <MDBox px={1} width="70%" height="100vh" mx="auto">
      <Grid container justifyContent="center" alignItems="center" height="100%">
        <Grid item xs={11} sm={9} md={9} lg={6} xl={4}>
          <Card>
            <MDBox
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
              mx={2}
              mt={-3}
              p={2}
              mb={1}
              textAlign="center"
            >
              <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                {title}
              </MDTypography>
            </MDBox>
            {/* @ts-ignore */}
            <FocusTrap>
              <MDBox pt={4} pb={3} px={3}>
                <MDBox component="form" role="form">
                  {children}
                  <MDBox mt={4} mb={1} display="flex">
                    <MDButton
                      variant="gradient"
                      color="info"
                      fullWidth
                      onClick={handleSaveData}
                      data-tut="reactour__seven"
                    >
                      Lưu
                    </MDButton>
                    <MDBox sx={{ width: "30px" }} />
                    <MDButton
                      variant="gradient"
                      color="error"
                      fullWidth
                      onClick={combineHandleClose}
                      data-tut="reactour__eight"
                    >
                      Hủy bỏ
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </FocusTrap>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

FormViewCamera.defaultProps = {
  children: <div />,
  handleClose: () => {},
};
export default FormViewCamera;
