import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { ERROR_TYPE, SUCCESS_TYPE, UPDATE_LABEL, UPDATE_SUCCESS } from "constants/app";
import {
  CODE_EMPTY_ERROR,
  LOCATION_CODE_IS_NOT_VALID,
  LOCATION_EMPTY_ERROR,
  CHAR_MAX_LENGTH,
} from "constants/validate";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { Location } from "models/base/location";
import { useState } from "react";
import { updateLocationApi } from "../api";
import { useAuthenController } from "../../../../context/authenContext";
import { updateLocationSuccess, useLocationController } from "../../../../context/locationContext";
import { checkMaxLengthOfString, getModuleOfUser, isValidLocationCode } from "utils/helpers";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import { CODE_FIELD, NAME_FIELD } from "../../../../constants/field";

function EditFormLocation({ handleClose, location }: { handleClose: any; location: Location }) {
  const [name, setName] = useState(location.name);
  const [code, setCode] = useState(location.code);

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
      label: "Tên chi nhánh",
      action: setName,
      actionBlur: setErrorName,
      error: errorName,
    },
    {
      data: code,
      type: "code",
      label: "Mã chi nhánh",
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
    } else if (!checkMaxLengthOfString(name)) {
      setErrorName(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (code === null || code.trim() === "") {
      setErrorCode(CODE_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidLocationCode(code.trim())) {
      setErrorCode(LOCATION_CODE_IS_NOT_VALID);
      checkValid = false;
    } else if (!checkMaxLengthOfString(code)) {
      setErrorCode(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    return checkValid;
  };

  const handleUpdateLocation = async () => {
    if (isValid()) {
      const updateLocationResponse = await updateLocationApi({
        token: authController.token,
        id: location.id,
        name: validateTextField(name),
        code: validateTextField(code),
        type: getModuleOfUser(authController.currentUser),
      });
      if (updateLocationResponse.data) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: UPDATE_SUCCESS,
        });
        handleClose();
        updateLocationSuccess(locationDispatch, updateLocationResponse.data);
      } else if (updateLocationResponse.fieldError) {
        switch (updateLocationResponse.fieldError) {
          case NAME_FIELD:
            setErrorName(updateLocationResponse.messageError);
            break;
          case CODE_FIELD:
            setErrorCode(updateLocationResponse.messageError);
            break;
          default:
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: updateLocationResponse.messageError,
            });
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: updateLocationResponse.messageError,
        });
      }
    }
  };
  const dataLocationDefault = () => ({
    id: location.id,
    name: location.name,
    code: location.code,
  });

  const isDataChange = () => {
    const dataLocation = dataLocationDefault();
    const dataAfter = {
      id: location.id,
      name,
      code,
    };
    return JSON.stringify(dataLocation) !== JSON.stringify(dataAfter);
  };

  return (
    <FormAddOrUpdate
      title="Cập nhật chi nhánh"
      fields={fields}
      handleAddOrUpdate={handleUpdateLocation}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    />
  );
}

export default EditFormLocation;
