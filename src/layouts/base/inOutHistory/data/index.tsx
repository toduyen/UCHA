import { useCallback, useEffect, useState } from "react";
import { getAllInOutHistoryApi } from "../api";
import { InOutHistory } from "models/base/inOutHistory";
import { convertStringTime } from "../../../../utils/helpers";
import { CardMedia } from "@mui/material";
import { useAuthenController } from "../../../../context/authenContext";
import {
  getAllInOutHistoriesSuccess,
  updateFilterInOutHistory,
  useInOutHistoryController,
} from "../../../../context/inOutHistoryContext";
import { isTimeKeepingModule } from "utils/checkRoles";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_MAX_LENGTH } from "../../../../constants/app";

export default function data() {
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [historyData, setHistoryData] = useState([]);

  // @ts-ignore
  const [authController] = useAuthenController();

  // @ts-ignore
  const [inOutHistoryController, inOutHistoryDispatch] = useInOutHistoryController();

  const [token, setToken] = useState(null);

  // save data filter
  const [filter, setFilter] = useState<{
    employeeChoosed: any;
    pageSize: number;
  }>({
    employeeChoosed: null,
    pageSize: 10,
  });

  useEffect(() => {
    setFilter(inOutHistoryController?.filter);
  }, [inOutHistoryController?.filter]);

  useEffect(
    () => () => {
      getAllInOutHistoriesSuccess(inOutHistoryDispatch, []);
      updateFilterInOutHistory(inOutHistoryDispatch, { employeeChoosed: null, pageSize: 10 });
    },
    []
  );

  useEffect(() => {
    if (token !== authController.token) {
      setToken(authController.token);
    }
    return () => {
      setFilter({
        employeeChoosed: null,
        pageSize: 10,
      });
    };
  }, [authController.token, token]);

  const fetchData = useCallback(
    async ({ page, size }) => {
      if (token) {
        const getAllInOutHistoryResponse = await getAllInOutHistoryApi({
          token,
          page,
          size,
          employeeId: filter?.employeeChoosed ? filter?.employeeChoosed?.id : undefined,
        });

        if (getAllInOutHistoryResponse.data !== null) {
          getAllInOutHistoriesSuccess(inOutHistoryDispatch, getAllInOutHistoryResponse.data.data);
          setPageCount(getAllInOutHistoryResponse.data.pageCount);
          setItemCount(getAllInOutHistoryResponse.data.itemCount);
        }
      }
    },
    [token, inOutHistoryController.employeeChoosed, filter]
  );

  const convertDataToRow = (history: InOutHistory) => ({
    cameraName: convertEllipsisCharacter(history?.camera?.name, STRING_MAX_LENGTH),
    checked: history.type,
    inOutAreaRestriction: history.areaRestrictionName,
    userName: convertEllipsisCharacter(history?.employee?.name, STRING_MAX_LENGTH),
    userCode: convertEllipsisCharacter(history?.employee?.code, STRING_MAX_LENGTH),
    manager:
      history.employee.manager !== null ? (
        <div>
          {convertEllipsisCharacter(history.employee.manager.code, 10)}-
          {convertEllipsisCharacter(history?.employee?.manager?.name, STRING_MAX_LENGTH)}
        </div>
      ) : (
        ""
      ),
    time: convertStringTime(history.time),
    image:
      history.image !== null ? (
        <CardMedia component="img" height="80" image={history.image.path} alt="" />
      ) : (
        <div />
      ),
  });
  useEffect(() => {
    if (inOutHistoryController.inOutHistories) {
      setHistoryData(
        inOutHistoryController.inOutHistories.map((history: InOutHistory) =>
          convertDataToRow(history)
        )
      );
    }
  }, [inOutHistoryController.inOutHistories]);

  return {
    columns: isTimeKeepingModule()
      ? [
          { Header: "Camera", accessor: "cameraName", align: "center" },
          { Header: "Check in/ Check out", accessor: "checked", align: "center" },
          { Header: "Tên nhân viên", accessor: "userName", align: "center" },
          { Header: "Mã nhân viên", accessor: "userCode", align: "center" },
          { Header: "Quản lý", accessor: "manager", align: "center" },
          { Header: "Thời gian", accessor: "time", align: "center" },
          { Header: "Hình ảnh", accessor: "image", align: "center" },
        ]
      : [
          { Header: "Camera", accessor: "cameraName", align: "center" },
          { Header: "Vào/Ra KVHC", accessor: "inOutAreaRestriction", align: "center" },
          { Header: "Tên nhân viên", accessor: "userName", align: "center" },
          { Header: "Mã nhân viên", accessor: "userCode", align: "center" },
          { Header: "Quản lý", accessor: "manager", align: "center" },
          { Header: "Thời gian", accessor: "time", align: "center" },
          { Header: "Hình ảnh", accessor: "image", align: "center" },
        ],

    rows: historyData,
    fetchData,
    pageCount,
    itemCount,
  };
}
