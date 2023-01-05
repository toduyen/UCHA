import axios from "axios";
import { axiosConfig } from "configs/api";
import { getAllInOutHistoryUrl, getInOutHistoryByIdUrl } from "constants/api";
import { SERVER_ERROR } from "constants/app";
import { convertResponseToInOutHistory } from "../../../../models/base/inOutHistory";

const getAllInOutHistoryApi = async ({
  token,
  page,
  size,
  timeStart,
  timeEnd,
  employeeId,
}: {
  token: any;
  page: number;
  size: number;
  timeStart?: string;
  timeEnd?: string;
  employeeId?: number;
}) => {
  let url = getAllInOutHistoryUrl(page, size);
  if (timeStart && timeEnd) {
    url += `&time_start=${timeStart}&time_end=${timeEnd}`;
  }
  if (employeeId) {
    url += `&employee_id=${employeeId}`;
  }
  return axios
    .get(url, axiosConfig(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: {
              data: response.data.histories.map((history: any) =>
                convertResponseToInOutHistory(history)
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
};

const getInOutHistoryByIdApi = async ({
  token,
  inOutHistoryId,
}: {
  token: string;
  inOutHistoryId: number;
}) => {
  const url = getInOutHistoryByIdUrl(inOutHistoryId);

  return axios
    .get(url, axiosConfig(token))
    .then((response) => {
      if (response.status === 200) {
        if (response.data.code === 1) {
          return {
            messageError: response.data.message,
            data: convertResponseToInOutHistory(response.data.history),
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
export { getAllInOutHistoryApi, getInOutHistoryByIdApi };
