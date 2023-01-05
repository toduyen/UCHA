import axios from "axios";
import { axiosConfig } from "configs/api";
import { getAllFeaturesUrl } from "constants/api";
import { ApiResponse } from "types/apiResponse";
import { SERVER_ERROR } from "constants/app";
import { convertResponseToFeature } from "../../../../models/base/feature";

const getAllFeaturesApi = async ({
  token,
  page,
  size,
  search,
}: {
  token: any;
  page: number;
  size: number;
  search?: string;
}): Promise<ApiResponse> => {
  const url = getAllFeaturesUrl(page, size, search || "");
  return axios
    .get(url, axiosConfig(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: {
              data: response.data.features.map((feature: any) => convertResponseToFeature(feature)),
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
};

export { getAllFeaturesApi };
