import axios from "axios";
import {
  ADD_USER_API,
  GET_ALL_ROLE_API,
  GET_NUMBER_ACCOUNT_API,
  getAllUserUrl,
  getDeleteUserUrl,
  getUpdateUserUrl,
  reSendCodeUrl,
} from "constants/api";
import { axiosConfig, axiosConfigMultipart } from "configs/api";
import { convertResponseToUser, User } from "models/base/user";
import { ApiResponse } from "types/apiResponse";
import { SERVER_ERROR } from "constants/app";
import { FORCE_CREATE, FORCE_UPDATE } from "../../../../constants/field";

const getAllUserApi = async ({
  token,
  status,
  page,
  size,
  search,
}: {
  token: string;
  status?: string;
  page?: number;
  size?: number;
  search?: string;
}): Promise<ApiResponse> =>
  axios
    .get(getAllUserUrl(status, page, size, search), axiosConfig(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: {
              data: response.data.users.map((user: User) => convertResponseToUser(user)),
              pageCount: response.data.total_pages,
              itemCount: response.data.total_items,
            },
          };
        }
        return {
          messageError: response.data.message,
          data: null,
        };
      }

      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    })
    .catch((e) => {
      console.log(e);
      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    });

const getAllRoleApi = async (token: string): Promise<ApiResponse> =>
  axios
    .get(GET_ALL_ROLE_API, axiosConfig(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return { messageError: response.data.message, data: response.data.roles };
        }
        return { messageError: response.data.message, data: null };
      }
      return { messageError: SERVER_ERROR, data: null };
    })
    .catch((e) => {
      console.log(e);
      return { messageError: SERVER_ERROR, data: null };
    });

const updateUserApi = async ({
  token,
  userId,
  file,
  fullName,
  email,
  organizationId,
  locationId,
  roles,
  forceUpdate,
}: {
  token: string;
  userId: number;
  file: any;
  fullName: string;
  email: string;
  organizationId: number;
  locationId: number | string;
  roles: string;
  forceUpdate?: boolean;
}): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fullname", fullName.trim());
  formData.append("user_id", userId.toString());
  formData.append("email", email.trim());
  formData.append("organization_id", organizationId.toString());
  formData.append("location_id", locationId.toString());
  formData.append("roles", roles);
  if (forceUpdate !== undefined) {
    formData.append(FORCE_UPDATE, forceUpdate.toString());
  }
  return axios
    .put(getUpdateUserUrl(userId), formData, axiosConfigMultipart(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: convertResponseToUser(response.data.user),
          };
        }
        return {
          messageError: response.data.message,
          data: null,
          fieldError: response.data.field_error,
        };
      }
      return { messageError: SERVER_ERROR, data: null };
    })
    .catch((e) => {
      console.log(e);
      return { messageError: SERVER_ERROR, data: null };
    });
};

const addUserApi = async ({
  token,
  file,
  fullName,
  email,
  roles,
  organizationId,
  locationId,
  forceCreate,
}: {
  token: string;
  file: any;
  fullName: string;
  email: string;
  roles: string;
  organizationId: number;
  locationId: number | string;
  forceCreate?: boolean;
}): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fullname", fullName.trim());
  formData.append("email", email.trim());
  formData.append("organization_id", organizationId.toString());
  formData.append("location_id", locationId.toString());
  formData.append("roles", roles);
  if (forceCreate !== undefined) {
    formData.append(FORCE_CREATE, forceCreate.toString());
  }
  return axios
    .post(ADD_USER_API, formData, axiosConfigMultipart(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: convertResponseToUser(response.data.user),
          };
        }
        return {
          messageError: response.data.message,
          data: null,
          fieldError: response.data.field_error,
        };
      }
      return { messageError: SERVER_ERROR, data: null };
    })
    .catch((e) => {
      console.log(e);
      return { messageError: SERVER_ERROR, data: null };
    });
};
const deleteUserApi = async ({ token, id }: { token: string; id: number }): Promise<ApiResponse> =>
  axios
    .delete(getDeleteUserUrl(id), axiosConfig(token))
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
          data: null,
        };
      }
      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    })
    .catch((e) => {
      console.log(e);
      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    });

const getAccountNumberApi = (token: string): Promise<ApiResponse> =>
  axios
    .get(GET_NUMBER_ACCOUNT_API, axiosConfig(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: response.data.number_account,
          };
        }
        return {
          messageError: response.data.message,
          data: null,
        };
      }
      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    })
    .catch((e) => {
      console.log(e);
      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    });

const reSendCodeUserApi = ({ token, id }: { token: string; id: number }): Promise<ApiResponse> =>
  axios
    .post(reSendCodeUrl(id), {}, axiosConfig(token))
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
          data: null,
        };
      }
      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    })
    .catch((e) => {
      console.log(e, token);
      return {
        messageError: SERVER_ERROR,
        data: null,
      };
    });
export {
  getAllUserApi,
  getAllRoleApi,
  updateUserApi,
  addUserApi,
  deleteUserApi,
  getAccountNumberApi,
  reSendCodeUserApi,
};
