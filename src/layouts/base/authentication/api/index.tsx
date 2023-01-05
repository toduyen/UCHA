import axios from "axios";
import { CHANGE_PASSWORD_API, RESET_PASSWORD_API, SIGN_IN_API } from "constants/api";
import { ApiResponse } from "types/apiResponse";
import { OLD_PASSWORD_NOT_CORRECT, SERVER_ERROR } from "constants/app";
import { convertResponseToUser } from "models/base/user";

const signInApi = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<ApiResponse> =>
  axios
    .post(SIGN_IN_API, {
      username: username.trim(),
      password,
    })
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: { user: convertResponseToUser(response.data.user), token: response.data.token },
          };
        }
        return {
          messageError: response.data.message,
          data: null,
          fieldError: response.data.field_error,
        };
      }

      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    })
    .catch((e) => {
      console.log(e, SIGN_IN_API);
      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    });

const resetPasswordApi = async ({ email }: { email: string }): Promise<ApiResponse> =>
  axios
    .post(RESET_PASSWORD_API, {
      email,
    })
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: true,
          };
        }
        return {
          messageError: response.data.message,
          data: false,
          fieldError: response.data.field_error,
        };
      }
      return {
        messageError: SERVER_ERROR,
        data: false,
      };
    })
    .catch((e) => {
      console.log(e);
      return {
        messageError: SERVER_ERROR,
        data: false,
      };
    });

const changePasswordApi = async ({
  userId,
  code,
  oldPassword,
  newPassword,
}: {
  userId: number;
  code: string;
  oldPassword: string;
  newPassword: string;
}): Promise<ApiResponse> =>
  axios
    .post(CHANGE_PASSWORD_API, {
      user_id: userId,
      old_password: oldPassword,
      code,
      new_password: newPassword,
    })
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: response.data.data,
          };
        }
        return {
          messageError: response.data.message,
          data: null,
          fieldError: response.data.field_error,
        };
      }
      return {
        messageError: OLD_PASSWORD_NOT_CORRECT,
        data: null,
      };
    })
    .catch((e) => {
      console.log(e);
      return {
        messageError: OLD_PASSWORD_NOT_CORRECT,
        data: null,
      };
    });
export { signInApi, resetPasswordApi, changePasswordApi };
