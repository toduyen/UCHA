import React, { ComponentProps, FC } from "react";
import MDBox from "../../bases/MDBox";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "../../bases/MDTypography";
import MDButton from "../../bases/MDButton";

export default function modalConfirmClose(
  str: string,
  closeAll: Function | undefined,
  closetFormConFirm: () => void
) {
  return (
    <MDBox px={1} width="80%" height="105vh" mx="auto">
      <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
        <Grid item xs={11} sm={12} md={10} lg={10} xl={3.5}>
          <Card>
            <MDBox pt={4} pb={3} px={3}>
              <MDBox component="form" role="form">
                <MDBox display="flex" justifyContent="center" color="white">
                  <MDTypography variant="p" fontWeight="medium" fontSize="17px">
                    Bạn có muốn đóng popup {str}
                  </MDTypography>
                </MDBox>
                <MDBox mt={4} mb={1} display="flex">
                  <MDButton variant="gradient" color="info" onClick={closeAll} fullWidth>
                    Xác nhận
                  </MDButton>
                  <MDBox sx={{ width: "30px" }} />
                  <MDButton
                    variant="gradient"
                    color="error"
                    onClick={() => closetFormConFirm()}
                    fullWidth
                  >
                    Hủy bỏ
                  </MDButton>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}
