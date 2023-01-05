import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import {
  ERROR_TYPE,
  FORCE_UPDATE_EMPLOYEE_TITLE,
  SUCCESS_TYPE,
  UPDATE_LABEL,
  UPDATE_SUCCESS,
} from "constants/app";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { User } from "models/base/user";
import React, { useEffect, useState } from "react";
import { updateUserApi } from "../api";
import {
  EMAIL_EMPTY_ERROR,
  EMAIL_INVALID_ERROR,
  CHAR_MAX_LENGTH,
  FULL_NAME_IS_NOT_VALID,
  FULLNAME_EMPTY_ERROR,
  LOCATION_EMPTY_ERROR,
  USER_ROLE_EMPTY_ERROR,
} from "../../../../constants/validate";
import { checkMaxLengthOfString, isValidEmail } from "../../../../utils/helpers";
import { isSuperAdmin, isSuperAdminOrganization } from "../../../../utils/checkRoles";
import AvatarUser from "../../../../components/customizes/AvatarUser";
import { Location } from "../../../../models/base/location";
import { useAuthenController } from "../../../../context/authenContext";
import { updateUserSuccess, useUserController } from "../../../../context/userContext";
import { useRoleController } from "../../../../context/roleContext";
import LocationAutocomplete from "layouts/base/location/components/LocationAutocomplete";
import { isValidUser, validateTextField } from "../../../../components/customizes/ValidateForm";
import RoleAutoComplete from "../../role/components/RoleAutoComplete";
import {
  EMAIL_FIELD,
  FORCE_UPDATE,
  FULLNAME_FIELD,
  LOCATION_ID_FIELD,
  ROLES_FIELD,
} from "../../../../constants/field";
import ConfirmUpdateForm from "../../employees/components/ConfirmUpdateForm";
import { Modal } from "@mui/material";

function EditFormUser({ handleClose, user }: { handleClose: any; user: User }) {
  const [avatar, setAvatar] = useState<any>(null);
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [roles, setRoles] = useState<any>(user.roles.map((role: any) => role.name));
  const [organizationName, setOrganizationName] = useState(user.organization?.name);
  const [location, setLocation] = React.useState<Location | null>(user.location);

  const [errorFullName, setErrorFullName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorRoles, setErrorRoles] = useState("");
  const [errorLocation, setErrorLocation] = useState("");
  const [organizationId] = useState(user.organization?.id);
  const [forceUpdate, setForceUpdate] = useState(false);

  const [open, setOpen] = useState(false);

  const handleCloseConfirmUpdateForm = () => {
    setOpen(false);
  };

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [, userDispatch] = useUserController();
  // @ts-ignore
  const [roleController] = useRoleController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  useEffect(() => {
    if (authController.token) {
      setRoles(
        isSuperAdmin(authController.currentUser) ||
          isSuperAdminOrganization(authController.currentUser)
          ? user.roles.map((role) => role.name)
          : user.roles[0].name
      );
    }
  }, [authController.token]);

  const fields = [
    {
      data: fullName,
      type: "name",
      label: "Họ và tên *",
      action: setFullName,
      actionBlur: setErrorFullName,
      error: errorFullName,
    },
    {
      data: email,
      type: "text",
      label: "Email *",
      action: setEmail,
      actionBlur: setErrorEmail,
      error: errorEmail,
    },
  ];

  const fieldSuperAdmin = [
    ...fields,
    {
      data: organizationName,
      type: "text",
      label: "Tổ chức *",
      action: setOrganizationName,
      actionBlur: () => {},
      error: "",
      disabled: true,
    },
  ];

  const fieldSuperAdminOrganization = [...fields];
  const fieldAdminOrganization = [...fields];

  const resetError = () => {
    setErrorFullName("");
    setErrorLocation("");
    setErrorRoles("");
    setErrorEmail("");
  };

  const isValid = () => {
    let checkValid = true;
    resetError();
    if (fullName === null || fullName.trim() === "") {
      setErrorFullName(FULLNAME_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidUser(fullName)) {
      setErrorFullName(FULL_NAME_IS_NOT_VALID);
      checkValid = false;
    } else if (!checkMaxLengthOfString(fullName.trim())) {
      setErrorFullName(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (email === null || email.trim() === "") {
      setErrorEmail(EMAIL_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidEmail(email)) {
      setErrorEmail(EMAIL_INVALID_ERROR);
      checkValid = false;
    } else if (!checkMaxLengthOfString(email)) {
      setErrorEmail(CHAR_MAX_LENGTH);
      checkValid = false;
    }
    if (roles === null || roles.length === 0) {
      setErrorRoles(USER_ROLE_EMPTY_ERROR);
      checkValid = false;
    }
    if (
      !isSuperAdmin(authController.currentUser) &&
      !isSuperAdminOrganization(authController.currentUser) &&
      location === null
    ) {
      setErrorLocation(LOCATION_EMPTY_ERROR);
      checkValid = false;
    }
    return checkValid;
  };

  // @ts-ignore
  useEffect(async () => {
    if (forceUpdate) {
      await handleUpdate();
      setOpen(false);
      setForceUpdate(false);
      window.location.reload();
    }
  }, [forceUpdate]);

  const handleUpdate = async () => {
    if (isValid() && user.organization) {
      const updateUserResponse = await updateUserApi({
        token: authController.token,
        userId: user.id,
        file: avatar,
        fullName: validateTextField(fullName),
        email: validateTextField(email),
        organizationId: user.organization?.id,
        locationId: location ? location.id : "",
        roles: Array.isArray(roles)
          ? `[${roles.map((role) => `"${role}"`).join(",")}]`
          : `["${roles}"]`,
        forceUpdate,
      });
      if (updateUserResponse.data !== null) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: UPDATE_SUCCESS,
        });
        handleClose();
        updateUserSuccess(userDispatch, updateUserResponse.data);
      } else if (updateUserResponse.fieldError) {
        switch (updateUserResponse.fieldError) {
          case FULLNAME_FIELD:
            setErrorFullName(updateUserResponse.messageError);
            break;
          case EMAIL_FIELD:
            setErrorEmail(updateUserResponse.messageError);
            break;
          case LOCATION_ID_FIELD:
            setErrorLocation(updateUserResponse.messageError);
            break;
          case ROLES_FIELD:
            setErrorRoles(updateUserResponse.messageError);
            break;
          case FORCE_UPDATE:
            setOpen(true);
            break;
          default:
            showSnackbar(snackbarDispatch, {
              typeSnackbar: ERROR_TYPE,
              messageSnackbar: updateUserResponse.messageError,
            });
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: updateUserResponse.messageError,
        });
      }
    }
  };
  const dataUserDefault = () => ({
    avatar: user.avatar,
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    organizationId: user.organization?.id,
    locationId: user.location ? user.location.id : "",
    roles: user.roles.map((role: any) => role.name),
  });

  const isDataChange = () => {
    const dataUser = dataUserDefault();
    const dataAfter = {
      avatar: avatar !== null ? avatar : user.avatar,
      userId: user.id,
      fullName,
      email,
      organizationId,
      locationId: location ? location.id : "",
      roles: Array.isArray(roles) ? [...roles] : [roles],
    };
    return JSON.stringify(dataUser) !== JSON.stringify(dataAfter);
  };
  // eslint-disable-next-line no-nested-ternary
  return authController.currentUser !== null && isSuperAdmin(authController.currentUser) ? (
    <FormAddOrUpdate
      title="Cập nhật người dùng"
      fields={fieldSuperAdmin}
      handleAddOrUpdate={handleUpdate}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      headChildren={<AvatarUser avatar={user.avatar} handleFile={(file) => setAvatar(file)} />}
      showConfirmClose={isDataChange()}
    >
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>
        <RoleAutoComplete
          // @ts-ignore
          defaultData={roles}
          type="autocomplete-multiple"
          label="Quyền *"
          action={setRoles}
          actionBlur={setErrorRoles}
          error={errorRoles}
        />
      </>
    </FormAddOrUpdate>
  ) : isSuperAdminOrganization(authController.currentUser) ? (
    <>
      <FormAddOrUpdate
        title="Cập nhật người dùng"
        fields={fieldSuperAdminOrganization}
        handleAddOrUpdate={handleUpdate}
        actionLabel={UPDATE_LABEL}
        visibleCloseButton
        handleClose={handleClose}
        headChildren={<AvatarUser avatar={user.avatar} handleFile={(file) => setAvatar(file)} />}
        showConfirmClose={isDataChange()}
        isShow={open}
      >
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <>
          <RoleAutoComplete
            // @ts-ignore
            defaultData={roles}
            type="autocomplete-multiple"
            label="Quyền *"
            action={setRoles}
            actionBlur={setErrorRoles}
            error={errorRoles}
          />
        </>
      </FormAddOrUpdate>
      <Modal
        open={open}
        onClose={handleCloseConfirmUpdateForm}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ConfirmUpdateForm
          title={FORCE_UPDATE_EMPLOYEE_TITLE}
          handleConfirmUpdate={async () => {
            setForceUpdate(true);
          }}
          handleClose={handleCloseConfirmUpdateForm}
        >
          <p>Quyền đã thuộc về người dùng khác. Bạn có muốn cập nhật không ?</p>
        </ConfirmUpdateForm>
      </Modal>
    </>
  ) : (
    <FormAddOrUpdate
      title="Cập nhật người dùng"
      fields={fieldAdminOrganization}
      handleAddOrUpdate={handleUpdate}
      actionLabel={UPDATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      headChildren={<AvatarUser avatar={user.avatar} handleFile={(file) => setAvatar(file)} />}
      showConfirmClose={isDataChange()}
    >
      <>
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
        <RoleAutoComplete
          // @ts-ignore
          defaultData={roles}
          type="autocomplete"
          label="Quyền *"
          action={setRoles}
          actionBlur={setErrorRoles}
          error={errorRoles}
        />
      </>
    </FormAddOrUpdate>
  );
}

export default EditFormUser;
