import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { ERROR_TYPE, SUCCESS_TYPE, UPDATE_LABEL, UPDATE_SUCCESS } from "constants/app";
import {
  DESCRIPTION_MAX_LENGTH,
  EMAIL_INVALID_ERROR,
  ORGANIZATION_EMPTY_ERROR,
  CHAR_MAX_LENGTH,
  PHONE_INVALID_ERROR,
} from "constants/validate";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { Organization } from "models/base/organization";
import { useState } from "react";
import {
  checkMaxLengthOfDescription,
  checkMaxLengthOfString,
  isValidEmail,
  isValidPhone,
} from "utils/helpers";
import { updateOrganizationApi } from "../api";
import { useAuthenController } from "../../../../context/authenContext";
import {
  updateOrganizationSuccess,
  useOrganizationController,
} from "../../../../context/organizationContext";
import { validateTextField } from "../../../../components/customizes/ValidateForm";
import {
  DESCRIPTION_FIELD,
  EMAIL_FIELD,
  NAME_FIELD,
  PHONE_FIELD,
} from "../../../../constants/field";

function EditFormOrganization({
  handleClose,
  organization,
}: {
  handleClose: any;
  organization: Organization;
}) {
  const [name, setName] = useState(organization.name || "");
  const [email, setEmail] = useState(organization.email || null);
  const [phone, setPhone] = useState(organization.phone || null);
  const [description, setDescription] = useState(organization.description || "");

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
    if (email !== null && !isValidEmail(email)) {
      setErrorEmail(EMAIL_INVALID_ERROR);
      checkValid = false;
      // @ts-ignore
    } else if (!checkMaxLengthOfString(email)) {
      setErrorEmail(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (phone !== null && !isValidPhone(phone)) {
      setErrorPhone(PHONE_INVALID_ERROR);
      checkValid = false;
    }
    if (!checkMaxLengthOfDescription(description.trim())) {
      setErrorDescription(DESCRIPTION_MAX_LENGTH);
      checkValid = false;
    }
    return checkValid;
  };

  const handleUpdate = async () => {
    if (organization && isValid()) {
      const updateOrganizationResponse = await updateOrganizationApi({
        token: authController.token,
        id: organization.id,
        name: validateTextField(name),
        email: validateTextField(email),
        phone: validateTextField(phone),
        description: validateTextField(description),
      });
      if (updateOrganizationResponse.data) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: UPDATE_SUCCESS,
        });
        handleClose();
        updateOrganizationSuccess(organizationDispatch, updateOrganizationResponse.data);
      } else if (updateOrganizationResponse.fieldError) {
        switch (updateOrganizationResponse.fieldError) {
          case NAME_FIELD:
            setErrorName(updateOrganizationResponse.messageError);
            break;
          case EMAIL_FIELD:
            setErrorEmail(updateOrganizationResponse.messageError);
            break;
          case PHONE_FIELD:
            setErrorPhone(updateOrganizationResponse.messageError);
            break;
          case DESCRIPTION_FIELD:
            setErrorDescription(updateOrganizationResponse.messageError);
            break;
          default:
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: updateOrganizationResponse.messageError,
            });
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: updateOrganizationResponse.messageError,
        });
      }
    }
  };
  const dataOrganizationDefault = () => ({
    name: organization?.name,
    email: organization?.email,
    phone: organization?.phone,
    description: organization?.description,
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
      title="Cập nhật tổ chức"
      fields={fields}
      handleAddOrUpdate={handleUpdate}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      showConfirmClose={isDataChange()}
    />
  );
}

export default EditFormOrganization;
