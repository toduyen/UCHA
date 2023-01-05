import React, { useEffect } from "react";
import Card from "@mui/material/Card";
import { Autocomplete, Checkbox, Modal, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import MDInput from "components/bases/MDInput";
import MDButton from "components/bases/MDButton";
import { FieldType, FormAddOrUpdateType } from "types/formAddOrUpdateType";
import PasswordFieldComponent from "./PasswordFieldComponent";
import { hideLoading, showLoading, useSnackbarController } from "context/snackbarContext";
import convertEllipsisCharacter from "../../ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";
import modalConfirmClose from "../../ModalConfirmClose";
import FocusTrap from "focus-trap-react";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function FormAddOrUpdate({
  title,
  fields,
  handleAddOrUpdate,
  actionLabel,
  visibleCloseButton,
  handleClose,
  headChildren,
  children,
  showConfirmClose,
  isShow,
}: FormAddOrUpdateType) {
  // @ts-ignore
  const [snackbarController, snackbarDispatch] = useSnackbarController();
  const [valueInputMultiple, setValueInputMultiple] = React.useState<string>("");
  const [valueInput, setValueInput] = React.useState<string>("");
  const [showModalClose, setShowModalClose] = React.useState<boolean>(false);
  const [isConfirm, setIsConfirm] = React.useState<boolean | null>(null);

  const [isShowState, setIsShowState] = React.useState(isShow || false);

  useEffect(() => {
    if (isShow !== undefined && isShow !== isShowState) {
      setIsShowState(isShow);
    }
  }, [isShow]);
  useEffect(() => {
    if (fields) {
      fields.forEach((field) => {
        if (field.choosedValue) {
          setValueInput(field.choosedValue);
        }
      });
      handleFocusField();
    }
  }, [fields]);

  const handleFocusField = () => {
    let hasElementFocus = false;
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
  };

  useEffect(() => {
    if (isConfirm === true) {
      setIsConfirm(false);
    }
  }, [isConfirm]);

  const handleChangeAutocomplete = (value: string, type: string) => {
    switch (type) {
      case "autocomplete-multiple":
        setValueInputMultiple(value);
        break;
      case "autocomplete":
        setValueInput(value);
        break;
      default:
        setValueInputMultiple(value);
        setValueInput(value);
        break;
    }
  };
  const handleOnBlur = (field: FieldType) => {
    if (field.actionBlur) {
      if (field.data && isConfirm === false) {
        field.actionBlur("");
        setValueInputMultiple("");
      } else return "";
    }
    return field.error;
  };
  const showAndHideModalClose = () => {
    setShowModalClose((prevState) => !prevState);
  };

  const getCardContent = () => (
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
        <MDTypography variant="h4" fontWeight="medium" color="white">
          {title}
        </MDTypography>
      </MDBox>
      <MDBox pt={4} pb={3} px={3} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <MDBox component="form" role="form">
          {headChildren}
          {/* eslint-disable-next-line react/prop-types */}
          {fields.map((field, index) => {
            if (field.type === "autocomplete-multiple") {
              return (
                <MDBox mb={2} key={`${field.label}_${index}`}>
                  <Autocomplete
                    value={field.checked}
                    key={`fields_${field.label}`}
                    onChange={(event, newOptions) => {
                      field.action(newOptions);
                      handleOnBlur(field);
                      if (newOptions) {
                        setValueInputMultiple("");
                      }
                    }}
                    multiple
                    disablePortal
                    disableCloseOnSelect
                    id={field.label}
                    options={field.data}
                    filterOptions={(optionsFilter: any) => optionsFilter}
                    onKeyDown={(event) => {
                      if (event.code !== "Tab") {
                        event.preventDefault();
                      }
                    }}
                    // show input value
                    inputValue={valueInputMultiple}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} style={{ marginBottom: "5px" }}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {convertEllipsisCharacter(option, STRING_SHORT_LENGTH_AUTOCOMPLETE)}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={field.label}
                        error={!!field.error}
                        helperText={field.error}
                        onChange={(event) => {
                          handleChangeAutocomplete(event?.target?.value, field?.type);
                        }}
                      />
                    )}
                    ListboxProps={{ style: { maxHeight: "15rem" } }}
                    onBlur={() => handleOnBlur(field)}
                  />
                </MDBox>
              );
            }
            if (field.type === "autocomplete") {
              return (
                <MDBox mb={2} key={`${field.label}_${index}`}>
                  <Autocomplete
                    value={field.choosedValue}
                    key={`fields_${field.label}`}
                    onChange={(event, newOptions, value) => {
                      handleOnBlur(field);
                      field.action(newOptions);
                      // @ts-ignore
                      if (newOptions) {
                        setValueInput(newOptions);
                      } else {
                        // @ts-ignore
                        setValueInput("");
                      }
                    }}
                    disablePortal
                    id={field.label}
                    options={field.data}
                    filterOptions={(optionsFilter: any) => optionsFilter}
                    inputValue={valueInput}
                    renderOption={(props, option) => (
                      <MDBox {...props} style={{ marginBottom: "5px" }}>
                        {convertEllipsisCharacter(option, 20)}
                      </MDBox>
                    )}
                    onKeyDown={(event) => {
                      if (event.code !== "Tab") {
                        event.preventDefault();
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={field.label}
                        error={!!field.error}
                        helperText={field.error}
                        onChange={(event) => {
                          handleChangeAutocomplete(event?.target?.value, field?.type);
                        }}
                      />
                    )}
                    ListboxProps={{ style: { maxHeight: "15rem" } }}
                    onBlur={() => handleOnBlur(field)}
                  />
                </MDBox>
              );
            }
            if (field.type === "password") {
              return <PasswordFieldComponent key={`${field.label}_${index}`} field={field} />;
            }
            return (
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
            );
          })}
          <div>{children}</div>
          <MDBox mt={4} mb={1} display="flex">
            <MDButton
              variant="gradient"
              color="info"
              fullWidth
              onClick={async () => {
                showLoading(snackbarDispatch);
                setIsConfirm(null);
                await handleAddOrUpdate();
                setIsConfirm(true);
                hideLoading(snackbarDispatch);
              }}
            >
              {actionLabel}
            </MDButton>

            {visibleCloseButton && (
              <>
                <MDBox sx={{ width: "30px" }} />
                <MDButton
                  variant="gradient"
                  color="error"
                  fullWidth
                  onClick={showConfirmClose ? showAndHideModalClose : handleClose}
                >
                  Hủy bỏ
                </MDButton>
              </>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );

  return (
    <MDBox px={1} width="100%" height="100vh" mx="auto" key={title}>
      <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
        <Grid item xs={11} sm={9} md={8} lg={6} xl={3.5}>
          {/* @ts-ignore */}
          <FocusTrap active={!showModalClose && !isShowState && !snackbarController?.showLoading}>
            <div>{getCardContent()}</div>
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

FormAddOrUpdate.defaultProps = {
  children: <div />,
  handleClose: () => {},
  visibleCloseButton: true,
};
export default FormAddOrUpdate;
