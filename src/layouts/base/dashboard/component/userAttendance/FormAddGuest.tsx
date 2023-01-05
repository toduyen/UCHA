import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { ADD_SUCCESS, CREATE_LABEL, ERROR_TYPE, SUCCESS_TYPE } from "constants/app";
import { useState } from "react";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import {
  EMAIL_EMPTY_ERROR,
  EMAIL_INVALID_ERROR,
  FULLNAME_EMPTY_ERROR,
  PHONE_EMPTY_ERROR,
  PHONE_INVALID_ERROR,
} from "constants/validate";
import { isValidEmail, isValidPhone } from "utils/helpers";
import { getAddGuestApi } from "../../api";
import { useAuthenController } from "context/authenContext";
import { useNotificationHistoryController } from "context/notificationHistoryContext";
import { addGuestSuccess, useGuestController } from "context/guestContext";

export function FormAddGuest({ handleClose }: { handleClose: Function }) {
  // const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [errorName, setErrorName] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [errorEmail, setErrorEmail] = useState("");

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  // @ts-ignore
  const [authController] = useAuthenController();

  // @ts-ignore
  const [, dispatch] = useGuestController();

  // @ts-ignore
  const [notificationHistoryController] = useNotificationHistoryController();
  const fields = [
    {
      data: name,
      type: "text",
      label: "Họ và tên *",
      action: setName,
      error: errorName,
    },
    {
      data: phone,
      type: "text",
      label: "Số điện thoại *",
      action: setPhone,
      error: errorPhone,
    },
    {
      data: email,
      type: "text",
      label: "Email *",
      action: setEmail,
      error: errorEmail,
    },
  ];

  const resetError = () => {
    setErrorName("");
    setErrorPhone("");
    setErrorEmail("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (name === null || name.trim() === "") {
      setErrorName(FULLNAME_EMPTY_ERROR);
      checkValid = false;
    }
    if (phone === null || phone.trim() === "") {
      setErrorPhone(PHONE_EMPTY_ERROR);
      checkValid = false;
    }
    if (!isValidPhone(phone)) {
      setErrorPhone(PHONE_INVALID_ERROR);
      checkValid = false;
    }
    if (email === null || email.trim() === "") {
      setErrorEmail(EMAIL_EMPTY_ERROR);
      checkValid = false;
    }
    if (!isValidEmail(email)) {
      setErrorEmail(EMAIL_INVALID_ERROR);
      checkValid = false;
    }
    return checkValid;
  };

  const handleCreateGuest = async () => {
    if (isValid()) {
      const addGuestResponse = await getAddGuestApi({
        token: authController.token,
        image: notificationHistoryController.userAttendanceChoosed.image,
        name,
        phone,
        email,
        areaRestrictionId: notificationHistoryController.userAttendanceChoosed.locationId,
        locationId: notificationHistoryController.userAttendanceChoosed.locationId,
      });
      if (addGuestResponse.data) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: ADD_SUCCESS,
        });
        handleClose();
        addGuestSuccess(dispatch, addGuestResponse.data);
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: addGuestResponse.messageError,
        });
      }
    }
  };

  return (
    <FormAddOrUpdate
      title="Thêm khách"
      fields={fields}
      handleAddOrUpdate={handleCreateGuest}
      actionLabel={CREATE_LABEL}
      visibleCloseButton
      handleClose={(e: any) => {
        e.stopPropagation();
        handleClose();
      }}
      headChildren={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "0.8em",
          }}
        >
          <img
            src={notificationHistoryController.userAttendanceChoosed.image}
            style={{ borderRadius: "50%", width: "25%" }}
            alt=""
          />
        </div>
      }
    />
  );
}
