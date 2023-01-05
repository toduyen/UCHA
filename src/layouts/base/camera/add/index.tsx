import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { CREATE_LABEL, ERROR_TYPE, SUCCESS_TYPE } from "constants/app";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import React, { useState } from "react";
import { Location } from "models/base/location";
import { addCameraApi } from "../api";
import {
  CAMERA_EMPTY_ERROR,
  CHAR_MAX_LENGTH,
  CREATE_CAMERA_SUCCESS,
  IP_CAMERA_EMPTY_ERROR,
  LOCATION_EMPTY_ERROR,
  NAME_AREA_EMPTY_ERROR,
  TYPE_CAMERA_EMPTY_ERROR,
} from "constants/validate";
import { useAuthenController } from "../../../../context/authenContext";
import { addCamera, useCameraController } from "../../../../context/cameraContext";
import { isAreaRestrictionModule, isBehaviorModule, isTimeKeepingModule } from "utils/checkRoles";
import { AreaRestriction } from "models/area-restriction/areaRestriction";
import LocationAutocomplete from "../../location/components/LocationAutocomplete";
import AreaRestrictionAutocomplete from "../../../area-restriction/areaRestriction/components/AreaRestrictionAutocomplete";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import {
  AREA_RESTRICTION_ID_FIELD,
  IP_ADDRESS_FIELD,
  LOCATION_ID_FIELD,
  NAME_FIELD,
  TYPE_FIELD,
} from "../../../../constants/field";
import { checkMaxLengthOfString } from "../../../../utils/helpers";

function AddCamera({ handleClose }: { handleClose: any }) {
  const [name, setName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [location, setLocation] = React.useState<Location | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [areaRestriction, setAreaRestriction] = React.useState<AreaRestriction | null>(null);

  const [errorName, setErrorName] = useState("");
  const [errorIpAddress, setErrorIpAddress] = useState("");
  const [errorLocation, setErrorLocation] = useState("");
  const [errorType, setErrorType] = useState("");
  const [errorAreaRestriction, setErrorAreaRestriction] = useState("");

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [, cameraDispatch] = useCameraController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const fields = [
    {
      data: name,
      type: "name",
      label: "Tên camera *",
      action: setName,
      actionBlur: setErrorName,
      error: errorName,
    },
    {
      data: ipAddress,
      type: "ipAddress",
      label: "Link rtsp camera *",
      action: setIpAddress,
      actionBlur: setErrorIpAddress,
      error: errorIpAddress,
    },
  ];
  const fieldsWithTimeKeeping = [
    ...fields,
    {
      data: ["Check in", "Check out"],
      type: "autocomplete",
      label: "Check in/ Check out *",
      action: setType,
      actionBlur: setErrorType,
      error: errorType,
    },
  ];

  const resetError = () => {
    setErrorName("");
    setErrorIpAddress("");
    setErrorType("");
    setErrorLocation("");
    setErrorAreaRestriction("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (name === null || name.trim() === "") {
      setErrorName(CAMERA_EMPTY_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(name.trim())) {
      setErrorName(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (ipAddress === null || ipAddress.trim() === "") {
      setErrorIpAddress(IP_CAMERA_EMPTY_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(ipAddress.trim())) {
      setErrorIpAddress(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (isTimeKeepingModule()) {
      if (type === null || type.trim() === "") {
        setErrorType(TYPE_CAMERA_EMPTY_ERROR);
        checkValid = false;
      }
      if (location === null) {
        setErrorLocation(LOCATION_EMPTY_ERROR);
        checkValid = false;
      }
    }
    if (isAreaRestrictionModule() || isBehaviorModule()) {
      if (areaRestriction === null) {
        setErrorAreaRestriction(NAME_AREA_EMPTY_ERROR);
        checkValid = false;
      }
    }
    return checkValid;
  };

  const checkType = () => {
    if (isTimeKeepingModule()) {
      return validateTextField(type);
    }
    if (isAreaRestrictionModule()) {
      return "Giám sát KVHC";
    }
    if (isBehaviorModule()) {
      return "Kiểm soát hành vi";
    }
    return "";
  };

  const handleCreateCamera = async () => {
    if (isValid()) {
      if (authController.token) {
        const addCameraResponse = await addCameraApi({
          token: authController.token,
          name: validateTextField(name),
          ipAddress: validateTextField(ipAddress),
          locationId: location ? location.id : null,
          type: checkType(),
          areaRestrictionId: areaRestriction ? areaRestriction.id : null,
        });

        if (addCameraResponse.data !== null) {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: SUCCESS_TYPE,
            messageSnackbar: CREATE_CAMERA_SUCCESS,
          });
          handleClose();
          addCamera(cameraDispatch, addCameraResponse.data);
        } else if (addCameraResponse.fieldError) {
          switch (addCameraResponse.fieldError) {
            case NAME_FIELD:
              setErrorName(addCameraResponse.messageError);
              break;
            case IP_ADDRESS_FIELD:
              setErrorIpAddress(addCameraResponse.messageError);
              break;
            case TYPE_FIELD:
              setErrorType(addCameraResponse.messageError);
              break;
            case LOCATION_ID_FIELD:
              setErrorLocation(addCameraResponse.messageError);
              break;
            case AREA_RESTRICTION_ID_FIELD:
              setErrorAreaRestriction(addCameraResponse.messageError);
              break;
            default:
              showSnackbar(snackbarDispatch, {
                typeSnackbar: ERROR_TYPE,
                messageSnackbar: addCameraResponse.messageError,
              });
          }
        } else {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: ERROR_TYPE,
            messageSnackbar: addCameraResponse.messageError,
          });
        }
      }
    }
  };
  const dataCameraDefault = () => ({
    name: "",
    ipAddress: "",
    locationId: null,
    type: null,
    areaRestrictionId: null,
  });

  const isDataChange = () => {
    const dataCamera = dataCameraDefault();
    const dataAfter = {
      name,
      ipAddress,
      locationId: location ? location?.id : null,
      type,
      areaRestrictionId: areaRestriction ? areaRestriction?.id : null,
    };
    return JSON.stringify(dataCamera) !== JSON.stringify(dataAfter);
  };
  return isTimeKeepingModule() ? (
    <FormAddOrUpdate
      title="Thêm mới camera"
      fields={fieldsWithTimeKeeping}
      handleAddOrUpdate={handleCreateCamera}
      actionLabel={CREATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    >
      <LocationAutocomplete
        type="autocomplete"
        label="Chi nhánh *"
        error={errorLocation}
        handleChoose={(locations) => {
          if (locations.length > 0) {
            setLocation(locations[0]);
          } else setLocation(null);
        }}
      />
    </FormAddOrUpdate>
  ) : (
    <FormAddOrUpdate
      title="Thêm mới camera"
      fields={fields}
      handleAddOrUpdate={handleCreateCamera}
      actionLabel={CREATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    >
      <AreaRestrictionAutocomplete
        type="autocomplete"
        label="Khu vực hạn chế *"
        error={errorAreaRestriction}
        handleChoose={(areaRestrictions) => {
          if (areaRestrictions.length > 0) {
            setAreaRestriction(areaRestrictions[0]);
          } else setAreaRestriction(null);
        }}
      />
    </FormAddOrUpdate>
  );
}

export default AddCamera;
