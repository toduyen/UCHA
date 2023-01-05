import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { CREATE_LABEL, ERROR_TYPE, SUCCESS_TYPE } from "constants/app";
import {
  CREATE_ORGANIZATION_SUCCESS,
  DESCRIPTION_MAX_LENGTH,
  EMAIL_INVALID_ERROR,
  ORGANIZATION_EMPTY_ERROR,
  CHAR_MAX_LENGTH,
  PHONE_INVALID_ERROR,
} from "constants/validate";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { useState } from "react";
import {
  checkMaxLengthOfDescription,
  checkMaxLengthOfString,
  isValidEmail,
  isValidPhone,
} from "utils/helpers";
import { addOrganizationApi } from "../api";
import { useAuthenController } from "../../../../context/authenContext";
import {
  addOrganizationSuccess,
  useOrganizationController,
} from "../../../../context/organizationContext";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import {
  DESCRIPTION_FIELD,
  EMAIL_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
} from "../../../../constants/field";

function AddOrganization({ handleClose }: { handleClose: any }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [errorDescription, setErrorDescription] = useState("");

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [, organizationDispatch] = useOrganizationController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();
  const fields = [
    {
      data: name,
      type: "name",
      label: "Tên tổ chức *",
      action: setName,
      actionBlur: setErrorName,
      error: errorName,
    },
    {
      data: email,
      type: "text",
      label: "Email",
      action: setEmail,
      actionBlur: setErrorEmail,
      error: errorEmail,
    },
    {
      data: phone,
      type: "phone",
      label: "Số điện thoại",
      action: setPhone,
      actionBlur: setErrorPhone,
      error: errorPhone,
    },
    {
      data: description,
      type: "description",
      label: "Mô tả",
      action: setDescription,
      error: errorDescription,
    },
  ];
  const resetError = () => {
    setErrorName("");
    setErrorEmail("");
    setErrorPhone("");
    setErrorDescription("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (name === null || name.trim() === "") {
      setErrorName(ORGANIZATION_EMPTY_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(name.trim())) {
      setErrorName(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (email.trim() !== "" && !isValidEmail(email)) {
      setErrorEmail(EMAIL_INVALID_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(email)) {
      setErrorEmail(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (phone.trim() !== "" && !isValidPhone(phone)) {
      setErrorPhone(PHONE_INVALID_ERROR);
      checkValid = false;
    }
    if (!checkMaxLengthOfDescription(description.trim())) {
      setErrorDescription(DESCRIPTION_MAX_LENGTH);
      checkValid = false;
    }

    return checkValid;
  };

  const handleCreateOrganization = async () => {
    if (isValid()) {
      const addOrganizationResponse = await addOrganizationApi({
        token: authController.token,
        name: validateTextField(name),
        email: validateTextField(email),
        phone: validateTextField(phone),
        description: validateTextField(description),
      });
      if (addOrganizationResponse.data) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: CREATE_ORGANIZATION_SUCCESS,
        });
        addOrganizationSuccess(organizationDispatch, addOrganizationResponse.data);
        handleClose();
      } else if (addOrganizationResponse.fieldError) {
        switch (addOrganizationResponse.fieldError) {
          case NAME_FIELD:
            setErrorName(addOrganizationResponse.messageError);
            break;
          case EMAIL_FIELD:
            setErrorEmail(addOrganizationResponse.messageError);
            break;
          case PHONE_FIELD:
            setErrorPhone(addOrganizationResponse.messageError);
            break;
          case DESCRIPTION_FIELD:
            setErrorDescription(addOrganizationResponse.messageError);
            break;
          default:
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: addOrganizationResponse.messageError,
            });
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: addOrganizationResponse.messageError,
        });
      }
    }
  };
  const dataOrganizationDefault = () => ({
    name: "",
    email: "",
    phone: "",
    description: "",
  });

  const isDataChange = () => {
    const dataOrganization = dataOrganizationDefault();
    const dataAfter = {
      name,
      email,
      phone,
      description,
    };
    return JSON.stringify(dataOrganization) !== JSON.stringify(dataAfter);
  };
  return (
    <FormAddOrUpdate
      title="Thêm tổ chức"
      fields={fields}
      handleAddOrUpdate={handleCreateOrganization}
      actionLabel={CREATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    />
  );
}

export default AddOrganization;
