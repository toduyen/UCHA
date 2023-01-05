import { Icon } from "@mui/material";
import MDAvatar from "components/bases/MDAvatar";
import MDBox from "components/bases/MDBox";
import MDDropzone from "components/bases/MDDropzone";
import MDTypography from "components/bases/MDTypography";
import FormInfo from "components/customizes/Form/FormInfo";
import { User } from "models/base/user";
import { useState } from "react";
import { updateMyInfoSuccess, useAuthenController } from "context/authenContext";
import { isValidEmail } from "utils/helpers";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { EMAIL_EMPTY_ERROR, EMAIL_INVALID_ERROR, FULLNAME_EMPTY_ERROR } from "constants/validate";
import {
  ERROR_TYPE,
  ROLE_SUPER_ADMIN_ORGANIZATION,
  STRING_LONG_LENGTH_MY_PROFILE,
  SUCCESS_TYPE,
  UPDATE_SUCCESS,
} from "constants/app";
import { updateUserApi } from "../../../../layouts/base/users/api";
import { isSuperAdminOrganization } from "../../../../utils/checkRoles";
// @ts-ignore
import avatarDefault from "assets/images/avatar_default.png";
import convertEllipsisCharacter from "../../ConvertEllipsisCharacter";

function ViewInformation({
  user,
  handleClose,
  handleClickUpdate,
}: {
  user: User;
  handleClose: any;
  handleClickUpdate: any;
}) {
  const getMyRole = () => {
    if (isSuperAdminOrganization(user)) {
      return ROLE_SUPER_ADMIN_ORGANIZATION;
    }
    return user.roles.map((role) => role.name).join(", ");
  };

  return (
    <FormInfo
      title="Thông tin cá nhân"
      handleClose={handleClose}
      enableUpdate
      handleUpdate={handleClickUpdate}
    >
      <MDBox display="flex" flexDirection="column">
        <MDBox display="flex" justifyContent="center" paddingBottom="41px">
          <MDAvatar
            src={user.avatar ? user.avatar.path : avatarDefault}
            alt={user.fullName}
            size="xxl"
            shadow="md"
          />
        </MDBox>
        <MDBox display="flex" flexDirection="column" lineHeight="28px">
          <MDTypography variant="text" color="text" fontSize="14px">
            Họ và tên: {convertEllipsisCharacter(user.fullName, STRING_LONG_LENGTH_MY_PROFILE)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px" style={{ display: "flex" }}>
            Email:&nbsp;{convertEllipsisCharacter(user.email, STRING_LONG_LENGTH_MY_PROFILE)}
          </MDTypography>
          <MDTypography variant="text" color="text" fontSize="14px">
            Tổ chức: {/* @ts-ignore */}
            {convertEllipsisCharacter(user.organization?.name, STRING_LONG_LENGTH_MY_PROFILE)}
          </MDTypography>
          {user.location && (
            <MDTypography variant="text" color="text" fontSize="14px">
              Chi nhánh:{" "}
              {convertEllipsisCharacter(user.location?.name, STRING_LONG_LENGTH_MY_PROFILE)}
            </MDTypography>
          )}
          <MDTypography variant="text" color="text" fontSize="14px">
            Quyền: {getMyRole()}
          </MDTypography>
        </MDBox>
      </MDBox>
    </FormInfo>
  );
}

function UpdateInformation({ user, handleClose }: { user: User; handleClose: any }) {
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();
  // @ts-ignore
  const [controller, dispatch] = useAuthenController();
  const [name, setName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState<any>(null);
  const [fileData, setFileData] = useState(null);

  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");

  const fields = [
    {
      data: name,
      type: "text",
      label: "Họ và tên *",
      action: setName,
      actionBlur: setErrorName,
      error: errorName,
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

  const resetError = () => {
    setErrorName("");
    setErrorEmail("");
  };
  const isValid = () => {
    resetError();
    let checkValid = true;
    if (name === null || name.trim() === "") {
      setErrorName(FULLNAME_EMPTY_ERROR);
      checkValid = false;
    }
    if (email === null || email.trim() === "") {
      setErrorEmail(EMAIL_EMPTY_ERROR);
      checkValid = false;
    } else if (!isValidEmail(email)) {
      setErrorEmail(EMAIL_INVALID_ERROR);

      checkValid = false;
    }
    return checkValid;
  };
  const handleChangeAvatar = (file: any, data: any) => {
    setAvatar(file);
    setFileData(data);
  };
  const handleUpdateInfo = async () => {
    if (user.organization && isValid()) {
      const updateInfoResponse = await updateUserApi({
        token: controller.token,
        userId: user.id,
        file: avatar,
        fullName: name,
        email,
        organizationId: user.organization.id,
        locationId: user.location ? user.location.id : "",
        roles: `[${user.roles.map((role) => `"${role.name}"`).join(",")}]`,
      });

      if (updateInfoResponse.data !== null) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: UPDATE_SUCCESS,
        });
        handleClose();
        // Update to local storage
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            token: controller.token,
            user: updateInfoResponse.data,
          })
        );
        // Update to reducer (context Api)
        updateMyInfoSuccess(dispatch, updateInfoResponse.data);
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: updateInfoResponse.messageError,
        });
      }
    }
  };

  const dataMyProfileDefault = () => ({
    avatar: user.avatar,
    name: user.fullName,
    email: user.email,
  });

  const isDataChange = () => {
    const dataMyProfile = dataMyProfileDefault();
    const dataAfter = {
      avatar: avatar !== null ? avatar : user.avatar,
      name,
      email,
    };
    return JSON.stringify(dataMyProfile) !== JSON.stringify(dataAfter);
  };

  return (
    <FormInfo
      title="Cập nhật thông tin cá nhân"
      fields={fields}
      handleClose={handleClose}
      enableUpdate
      handleUpdate={handleUpdateInfo}
      showConfirmClose={isDataChange()}
    >
      <MDBox display="flex" justifyContent="center" paddingBottom="41px">
        <MDDropzone
          handleOnAbort={() => {}}
          handleOnError={() => {}}
          handleOnLoad={handleChangeAvatar}
        >
          <MDBox position="relative">
            <MDAvatar
              src={avatar === null && user.avatar !== null ? user.avatar.path : fileData}
              alt={name}
              size="xxl"
              shadow="md"
            />
            <Icon
              style={{
                color: "white",
                position: "absolute",
                top: "40%",
                left: "40%",
              }}
            >
              image
            </Icon>
          </MDBox>
        </MDDropzone>
      </MDBox>
    </FormInfo>
  );
}

function MyProfile({ handleClose, user }: { handleClose: any; user: User }) {
  const [isUpdateForm, setIsUpdateForm] = useState(false);
  const handleClickUpdate = () => {
    setIsUpdateForm(true);
  };

  return !isUpdateForm ? (
    <ViewInformation user={user} handleClose={handleClose} handleClickUpdate={handleClickUpdate} />
  ) : (
    <UpdateInformation user={user} handleClose={handleClose} />
  );
}

export default MyProfile;
