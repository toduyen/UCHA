import React, { useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import MDButton from "components/bases/MDButton";
import modalConfirmClose from "../../ModalConfirmClose";
import { Modal } from "@mui/material";
import { FieldType } from "../../../../types/formAddOrUpdateType";
import MDInput from "../../../bases/MDInput";
import FocusTrap from "focus-trap-react";
import { useSnackbarController } from "../../../../context/snackbarContext";

type Props = {
  title: string;
  handleClose?: Function;
  handleUpdate?: Function;
  enableUpdate: Boolean;
  children?: React.ReactElement;
  showConfirmClose?: boolean;
  fields?: Array<FieldType>;
  isShow?: boolean;
};

function FormInfo({
  title,
  handleClose,
  children,
  handleUpdate,
  enableUpdate,
  showConfirmClose,
  fields,
  isShow,
}: Props) {
  const [showModalClose, setShowModalClose] = React.useState<boolean>(false);
  // @ts-ignore
  const [snackbarController, snackbarDispatch] = useSnackbarController();
  const [isShowState, setIsShowState] = React.useState(isShow || false);

  useEffect(() => {
    if (isShow !== undefined && isShow !== isShowState) {
      setIsShowState(isShow);
    }
  }, [isShow]);

  const showAndHideModalClose = () => {
    setShowModalClose((prevState) => !prevState);
  };

  useEffect(() => {
    if (fields) {
      handleFocusField();
    }
  }, [fields]);

  const handleFocusField = () => {
    let hasElementFocus = false;
    if (fields) {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const elem = document.getElementById(field.label);
        if (elem === document.activeElement) {
          hasElementFocus = true;
          break;
        }
      }
      if (!hasElementFocus) {
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          if (field.error !== undefined) {
            if (field.error.length > 0 && document.getElementById(field.label)) {
              // @ts-ignore
              document.getElementById(field.label).focus();
              break;
            }
          }
        }
      }
    }
  };

  return (
    <MDBox px={1} width="100%" height="100vh" mx="auto">
      <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
        <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
          {/* @ts-ignore */}
          <FocusTrap active={!showModalClose && !isShowState && !snackbarController?.showLoading}>
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
              <MDBox pt={4} pb={3} px={3}>
                <MDBox component="form" role="form">
                  {children}
                  {fields &&
                    fields.map((field, index) => (
                      <MDBox mb={2} key={`${field.label}_${index}`}>
                        <MDInput
                          hightlighterror={!!field.error}
                          value={field.data}
                          type={field.type}
                          label={field.label}
                          fullWidth
                          onChange={(e: any) => {
                            if (field.actionBlur) {
                              field.actionBlur("");
                            }
                            return field.action(e.target.value);
                          }}
                          helperText={field.error}
                          disabled={field.disabled}
                          id={field.label}
                        />
                      </MDBox>
                    ))}

                  <MDBox mt={4} mb={1} display="flex">
                    <>
                      {enableUpdate && (
                        <>
                          <MDButton
                            variant="gradient"
                            color="info"
                            fullWidth
                            onClick={handleUpdate}
                          >
                            Cập nhật
                          </MDButton>
                          <MDBox sx={{ width: "30px" }} />
                        </>
                      )}
                      <MDButton
                        variant="gradient"
                        color="error"
                        fullWidth
                        onClick={showConfirmClose ? showAndHideModalClose : handleClose}
                      >
                        Đóng
                      </MDButton>
                    </>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </FocusTrap>
        </Grid>
      </Grid>
      <Modal
        open={showModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {modalConfirmClose(title, handleClose, showAndHideModalClose)}
      </Modal>
    </MDBox>
  );
}

FormInfo.defaultProps = {
  children: <div />,
  handleClose: () => {},
};
export default FormInfo;
