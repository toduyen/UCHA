import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { CREATE_LABEL, ERROR_TYPE, SUCCESS_TYPE } from "constants/app";
import { useState } from "react";
import { addLocationApi } from "../api";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import {
  CODE_EMPTY_ERROR,
  CREATE_LOCATION_SUCCESS,
  CHAR_MAX_LENGTH,
  LOCATION_CODE_IS_NOT_VALID,
  LOCATION_EMPTY_ERROR,
} from "constants/validate";
import { useAuthenController } from "../../../../context/authenContext";
import { addLocationSuccess, useLocationController } from "../../../../context/locationContext";
import { checkMaxLengthOfString, getModuleOfUser, isValidLocationCode } from "utils/helpers";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import { CODE_FIELD, NAME_FIELD } from "../../../../constants/field";

function AddLocation({ handleClose }: { handleClose: any }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [errorName, setErrorName] = useState("");
  const [errorCode, setErrorCode] = useState("");

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [, locationDispatch] = useLocationController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const fields = [
    {
      data: name,
      type: "name",
      label: "Tên chi nhánh *",
      action: setName,
      actionBlur: setErrorName,
      error: errorName,
    },
    {
      data: code,
      type: "code",
      label: "Mã chi nhánh *",
      action: setCode,
      actionBlur: setErrorCode,
      error: errorCode,
    },
  ];

  const resetError = () => {
    setErrorName("");
    setErrorCode("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (name === null || name.trim() === "") {
      setErrorName(LOCATION_EMPTY_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(name.trim())) {
      setErrorName(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (code === null || code.trim() === "") {
      setErrorCode(CODE_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidLocationCode(code.trim())) {
      setErrorCode(LOCATION_CODE_IS_NOT_VALID);
      checkValid = false;
    } else if (!checkMaxLengthOfString(code.trim())) {
      setErrorCode(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    return checkValid;
  };

  const handleCreateLocation = async () => {
    if (isValid()) {
      const addLocationResponse = await addLocationApi({
        token: authController.token,
        name: validateTextField(name),
        code: validateTextField(code),
        type: getModuleOfUser(authController.currentUser),
      });

      if (addLocationResponse.data) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: CREATE_LOCATION_SUCCESS,
        });
        handleClose();
        addLocationSuccess(locationDispatch, addLocationResponse.data);
      } else if (addLocationResponse.fieldError) {
        switch (addLocationResponse.fieldError) {
          case NAME_FIELD:
            setErrorName(addLocationResponse.messageError);
            break;
          case CODE_FIELD:
            setErrorCode(addLocationResponse.messageError);
            break;
          default:
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: addLocationResponse.messageError,
            });
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: addLocationResponse.messageError,
        });
      }
    }
  };
  const dataLocationDefault = () => ({
    name: "",
    code: "",
  });

  const isDataChange = () => {
    const dataLocation = dataLocationDefault();
    const dataAfter = {
      name,
      code,
    };
    return JSON.stringify(dataLocation) !== JSON.stringify(dataAfter);
  };

  return (
    <FormAddOrUpdate
      title="Thêm chi nhánh"
      fields={fields}
      handleAddOrUpdate={handleCreateLocation}
      actionLabel={CREATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    />
  );
}

export default AddLocation;
