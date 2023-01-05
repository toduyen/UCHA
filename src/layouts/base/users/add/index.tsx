import React, { useEffect, useState } from "react";
import { addUserApi } from "layouts/base/users/api";
import { checkMaxLengthOfString, isValidEmail } from "utils/helpers";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { CREATE_LABEL, ERROR_TYPE, FORCE_UPDATE_EMPLOYEE_TITLE, SUCCESS_TYPE } from "constants/app";
import {
  CREATE_USER_SUCCESS,
  EMAIL_EMPTY_ERROR,
  EMAIL_INVALID_ERROR,
  CHAR_MAX_LENGTH,
  FULL_NAME_IS_NOT_VALID,
  FULLNAME_EMPTY_ERROR,
  LOCATION_EMPTY_ERROR,
  ORGANIZATION_EMPTY_ERROR,
  USER_ROLE_EMPTY_ERROR,
} from "constants/validate";
import FormAddOrUpdate from "components/customizes/Form/FormAddOrUpdate";
import { Organization } from "models/base/organization";
import { isSuperAdmin, isSuperAdminOrganization } from "../../../../utils/checkRoles";
import { Location } from "../../../../models/base/location";
import { addUser, useUserController } from "context/userContext";
import { useAuthenController } from "context/authenContext";
import { useRoleController } from "context/roleContext";
import { useOrganizationController } from "context/organizationContext";
import LocationAutocomplete from "layouts/base/location/components/LocationAutocomplete";
import { isValidUser, validateTextField } from "../../../../components/customizes/ValidateForm";
import OrganizationAutoComplete from "../../organization/components/OrganizationAutoComplete";
import RoleAutoComplete from "../../role/components/RoleAutoComplete";
import {
  EMAIL_FIELD,
  FORCE_CREATE,
  FULLNAME_FIELD,
  LOCATION_ID_FIELD,
  ORGANIZATION_ID_FIELD,
  ROLES_FIELD,
} from "../../../../constants/field";
import AvatarUser from "../../../../components/customizes/AvatarUser";
import { Modal } from "@mui/material";
import ConfirmUpdateForm from "../../employees/components/ConfirmUpdateForm";

function AddUser({ handleClose }: { handleClose: any }) {
  const [avatar, setAvatar] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = React.useState<any>([]);
  const [organizationName, setOrganizationName] = React.useState<any>("");
  const [location, setLocation] = React.useState<Location | null>(null);

  const [errorFullName, setErrorFullName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorRoles, setErrorRoles] = useState("");
  const [errorOrganization, setErrorOganization] = useState("");
  const [errorLocation, setErrorLocation] = useState("");

  const [open, setOpen] = useState(false);
  const [forceCreate, setForceCreate] = useState(false);
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
  const [organizationController] = useOrganizationController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const fields = [
    {
      data: fullName,
      type: "fullName",
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

  const fieldsSuperAdmin = [...fields];

  const fieldsSuperAdminOrganization = [...fields];

  const fieldsAdminOrganization = [...fields];

  const getOrganizationFromName = () => {
    const organizations = organizationController.organizations.filter(
      (item: Organization) => item.name === organizationName
    );
    if (organizations.length > 0) {
      return organizations[0];
    }
    return null;
  };

  const resetError = () => {
    setErrorFullName("");
    setErrorOganization("");
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
    } else if (!isValidEmail(email.trim())) {
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
      isSuperAdmin(authController.currentUser) &&
      (organizationName === null || organizationName.trim() === "")
    ) {
      setErrorOganization(ORGANIZATION_EMPTY_ERROR);
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
    if (forceCreate) {
      await handleCreateUser();
      setOpen(false);
      setForceCreate(false);
    }
  }, [forceCreate]);

  const handleCreateUser = async () => {
    if (isValid()) {
      const organization = isSuperAdmin(authController.currentUser)
        ? getOrganizationFromName()
        : authController.currentUser.organization;
      if (organization !== null) {
        const addUserResponse = await addUserApi({
          token: authController.token,
          file: avatar,
          fullName: validateTextField(fullName),
          email: validateTextField(email),
          roles: Array.isArray(roles)
            ? `[${roles.map((role) => `"${role}"`).join(",")}]`
            : `["${roles}"]`,
          organizationId: organization.id,
          locationId: location ? location.id : "",
          forceCreate,
        });

        if (addUserResponse.data !== null) {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: SUCCESS_TYPE,
            messageSnackbar: CREATE_USER_SUCCESS,
          });
          handleClose();
          addUser(userDispatch, addUserResponse.data);
        } else if (addUserResponse.fieldError) {
          switch (addUserResponse.fieldError) {
            case FULLNAME_FIELD:
              setErrorFullName(addUserResponse.messageError);
              break;
            case EMAIL_FIELD:
              setErrorEmail(addUserResponse.messageError);
              break;
            case ORGANIZATION_ID_FIELD:
              setErrorOganization(addUserResponse.messageError);
              break;
            case LOCATION_ID_FIELD:
              setErrorLocation(addUserResponse.messageError);
              break;
            case ROLES_FIELD:
              setErrorRoles(addUserResponse.messageError);
              break;
            case FORCE_CREATE:
              setOpen(true);
              break;
            default:
              showSnackbar(snackbarDispatch, {
                typeSnackbar: ERROR_TYPE,
                messageSnackbar: addUserResponse.messageError,
              });
          }
        } else {
          showSnackbar(snackbarDispatch, {
            typeSnackbar: ERROR_TYPE,
            messageSnackbar: addUserResponse.messageError,
          });
        }
      }
    }
  };
  const dataUserDefault = () => {
    const organization = isSuperAdmin(authController.currentUser)
      ? null
      : authController.currentUser.organization;
    return {
      avatar: null,
      fullName: "",
      email: "",
      roles: [],
      organizationId: organization ? organization.id : null,
      locationId: "",
    };
  };

  const isDataChange = () => {
    const organization = isSuperAdmin(authController.currentUser)
      ? getOrganizationFromName()
      : authController.currentUser.organization;
    const dataUser = dataUserDefault();
    const dataAfter = {
      avatar: avatar ? avatar : null,
      fullName: validateTextField(fullName),
      email: validateTextField(email),
      roles: roles ? roles : [],
      organizationId: organization ? organization.id : null,
      locationId: location ? location.id : "",
    };
    return JSON.stringify(dataUser) !== JSON.stringify(dataAfter);
  };
  // eslint-disable-next-line no-nested-ternary
  return isSuperAdmin(authController.currentUser) ? (
    <FormAddOrUpdate
      title="Thêm người dùng"
      fields={fieldsSuperAdmin}
      handleAddOrUpdate={handleCreateUser}
      actionLabel={CREATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      headChildren={<AvatarUser avatar={avatar} handleFile={(file) => setAvatar(file)} />}
      showConfirmClose={isDataChange()}
    >
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>
        <OrganizationAutoComplete
          type="autocomplete"
          label="Tổ chức *"
          action={setOrganizationName}
          actionBlur={setErrorOganization}
          error={errorOrganization}
        />
        <RoleAutoComplete
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
        title="Thêm người dùng"
        fields={fieldsSuperAdminOrganization}
        handleAddOrUpdate={handleCreateUser}
        actionLabel={CREATE_LABEL}
        visibleCloseButton
        handleClose={handleClose}
        headChildren={<AvatarUser avatar={avatar} handleFile={(file) => setAvatar(file)} />}
        showConfirmClose={isDataChange()}
        isShow={open}
      >
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <>
          <RoleAutoComplete
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
            setForceCreate(true);
          }}
          handleClose={handleCloseConfirmUpdateForm}
        >
          <p>Quyền đã thuộc về người dùng khác. Bạn có muốn cập nhật không ?</p>
        </ConfirmUpdateForm>
      </Modal>
    </>
  ) : (
    <FormAddOrUpdate
      title="Thêm người dùng"
      fields={fieldsAdminOrganization}
      handleAddOrUpdate={handleCreateUser}
      actionLabel={CREATE_LABEL}
      visibleCloseButton
      handleClose={handleClose}
      headChildren={<AvatarUser avatar={avatar} handleFile={(file) => setAvatar(file)} />}
      showConfirmClose={isDataChange()}
    >
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>
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
        <RoleAutoComplete
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

export default AddUser;
