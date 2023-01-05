import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { ERROR_TYPE, SUCCESS_TYPE, UPDATE_LABEL, UPDATE_SUCCESS } from "constants/app";
import { Camera } from "models/base/camera";
import { Location } from "models/base/location";
import { useState } from "react";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { updateCameraApi } from "../api";
import { useAuthenController } from "../../../../context/authenContext";
import { updateCameraSuccess, useCameraController } from "../../../../context/cameraContext";
import { isAreaRestrictionModule, isBehaviorModule, isTimeKeepingModule } from "utils/checkRoles";
import { AreaRestriction } from "models/area-restriction/areaRestriction";
import LocationAutocomplete from "../../location/components/LocationAutocomplete";
import AreaRestrictionAutocomplete from "../../../area-restriction/areaRestriction/components/AreaRestrictionAutocomplete";
import {
  CAMERA_EMPTY_ERROR,
  CHAR_MAX_LENGTH,
  IP_CAMERA_EMPTY_ERROR,
  LOCATION_EMPTY_ERROR,
  NAME_AREA_EMPTY_ERROR,
  TYPE_CAMERA_EMPTY_ERROR,
} from "../../../../constants/validate";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import {
  AREA_RESTRICTION_ID_FIELD,
  IP_ADDRESS_FIELD,
  LOCATION_ID_FIELD,
  NAME_FIELD,
  TYPE_FIELD,
} from "../../../../constants/field";
import { checkMaxLengthOfString } from "../../../../utils/helpers";

function EditFormCamera({ handleClose, camera }: { handleClose: any; camera: Camera }) {
  const [name, setName] = useState(camera.name);
  const [ipAddress, setIpAddress] = useState(camera.ipAddress);
  const [location, setLocation] = useState<Location | null>(camera.location);
  const [type, setType] = useState(camera.type);
  const [areaRestriction, setAreaRestriction] = useState<AreaRestriction | null>(
    camera.areaRestriction
  );

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
      choosedValue: type,
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
      if (type === null) {
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
  const handleUpdate = async () => {
    if (isValid()) {
      const updateCameraResponse = await updateCameraApi({
        token: authController.token,
        id: camera.id,
        name: validateTextField(name),
        ipAddress: validateTextField(ipAddress?.toString()),
        locationId: location ? location?.id : null,
        type: checkType(),
        areaRestrictionId: areaRestriction ? areaRestriction?.id : null,
      });

      if (updateCameraResponse.data) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: UPDATE_SUCCESS,
        });

        handleClose();
        updateCameraSuccess(cameraDispatch, updateCameraResponse.data);
      } else if (updateCameraResponse.fieldError) {
        switch (updateCameraResponse.fieldError) {
          case NAME_FIELD:
            setErrorName(updateCameraResponse.messageError);
            break;
          case IP_ADDRESS_FIELD:
            setErrorIpAddress(updateCameraResponse.messageError);
            break;
          case TYPE_FIELD:
            setErrorType(updateCameraResponse.messageError);
            break;
          case LOCATION_ID_FIELD:
            setErrorLocation(updateCameraResponse.messageError);
            break;
          case AREA_RESTRICTION_ID_FIELD:
            setErrorAreaRestriction(updateCameraResponse.messageError);
            break;
          default:
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: updateCameraResponse.messageError,
            });
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: updateCameraResponse.messageError,
        });
      }
    }
  };
  const dataCameraDefault = () => ({
    id: camera.id,
    name: camera.name,
    ipAddress: camera.ipAddress,
    locationId: camera.location ? camera.location?.id : null,
    type: camera.type || "",
    areaRestrictionId: camera.areaRestriction ? camera.areaRestriction?.id : null,
  });

  const isDataChange = () => {
    const dataCamera = dataCameraDefault();
    const dataAfter = {
      id: camera.id,
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
      title="Cập nhật camera"
      fields={fieldsWithTimeKeeping}
      handleAddOrUpdate={handleUpdate}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    >
      <LocationAutocomplete
        type="autocomplete"
        label="Chi nhánh *"
        error={errorLocation}
        defaultData={location ? Array.of(location) : []}
        handleChoose={(locations) => {
          if (locations.length > 0) {
            setLocation(locations[0]);
          } else setLocation(null);
        }}
      />
    </FormAddOrUpdate>
  ) : (
    <FormAddOrUpdate
      title="Cập nhật camera"
      fields={fields}
      handleAddOrUpdate={handleUpdate}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    >
      <AreaRestrictionAutocomplete
        type="autocomplete"
        label="Khu vực hạn chế *"
        error={errorAreaRestriction}
        defaultData={areaRestriction ? Array.of(areaRestriction) : []}
        handleChoose={(areaRestrictions) => {
          if (areaRestrictions.length > 0) {
            setAreaRestriction(areaRestrictions[0]);
          } else setAreaRestriction(null);
        }}
      />
    </FormAddOrUpdate>
  );
}

export default EditFormCamera;
