import axios from "axios";
import { axiosConfig } from "configs/api";
import {
  ADD_ORGANIZATION_API,
  getAllOrganizations,
  getDeleteOrganizationUrl,
  getUpdateOrganizationUrl,
} from "constants/api";
import { ApiResponse } from "../../../../types/apiResponse";
import { SERVER_ERROR } from "../../../../constants/app";
import { convertResponseToOrganization } from "../../../../models/base/organization";

const getAllOrganizationApi = async ({
  token,
  page,
  size,
  search,
}: {
  token: string;
  page?: number | string;
  size?: number | string;
  search?: string;
}): Promise<ApiResponse> =>
  axios
    .get(getAllOrganizations(page, size, search), axiosConfig(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: {
              data: response.data.organizations.map((item: any) =>
                convertResponseToOrganization(item)
              ),
              pageCount: response.data.total_pages,
              itemCount: response.data.total_items,
            },
          };
        }
        return { messageError: response.data.message, data: null };
      }
      return { messageError: SERVER_ERROR, data: null };
    })
    .catch((e) => {
      console.log(e);
      return { messageError: SERVER_ERROR, data: null };
    });

const addOrganizationApi = async ({
  token,
  name,
  email,
  phone,
  description,
}: {
  token: string;
  name: string;
  email: string | null;
  phone: string | null;
  description: string | null;
}): Promise<ApiResponse> =>
  axios
    .post(
      ADD_ORGANIZATION_API,
      {
        name: name.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        description: description?.trim(),
      },
      axiosConfig(token)
    )
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: convertResponseToOrganization(response.data.organization),
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

const deleteOrganizationApi = async ({
  token,
  id,
}: {
  token: string;
  id: number;
}): Promise<ApiResponse> =>
  axios
    .delete(getDeleteOrganizationUrl(id), axiosConfig(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return { messageError: response.data.message, data: true };
        }
        return { messageError: response.data.message, data: null };
      }
      return { messageError: SERVER_ERROR, data: null };
    })
    .catch((e) => {
      console.log(e);
      return { messageError: SERVER_ERROR, data: null };
    });

const updateOrganizationApi = async ({
  token,
  id,
  name,
  email,
  phone,
  description,
}: {
  token: string;
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  description: string | null;
}): Promise<ApiResponse> =>
  axios
    .put(
      getUpdateOrganizationUrl(id),
      {
        name: name.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        description: description?.trim(),
      },
      axiosConfig(token)
    )
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: convertResponseToOrganization(response.data.organization),
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

export { getAllOrganizationApi, addOrganizationApi, deleteOrganizationApi, updateOrganizationApi };
