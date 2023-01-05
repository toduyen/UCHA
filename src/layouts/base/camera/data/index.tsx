import { useCallback, useEffect, useState } from "react";
import { getAllCameraApi } from "../api";
import { Camera } from "models/base/camera";
import { Icon } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDButton from "components/bases/MDButton";
import { useAuthenController } from "../../../../context/authenContext";
import {
  getAllCameraSuccess,
  updateFilterCamera,
  useCameraController,
} from "../../../../context/cameraContext";
import { isTimeKeepingModule } from "../../../../utils/checkRoles";
import { convertStatusToString } from "utils/helpers";
import RowAction from "components/customizes/Tables/RowAction";
import { AcionType } from "../../../../types/actionType";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_MAX_LENGTH } from "../../../../constants/app";

export default function data({ handleView, handleEdit, handleDelete, handleSetting }: AcionType) {
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const [rowTableDatas, setRowTableData] = useState([]);
  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [cameraController, cameraDispatch] = useCameraController();

  const [token, setToken] = useState(null);

  const [filter, setFilter] = useState<{
    areaRestriction: any;
    pageSize: number;
    search: string;
    status: string;
  }>({
    areaRestriction: null,
    pageSize: 10,
    search: "",
    status: "Đang hoạt động",
  });

  useEffect(
    () => () => {
      getAllCameraSuccess(cameraDispatch, []);
      updateFilterCamera(cameraDispatch, {
        status: "Đang hoạt động",
        pageSize: 10,
        search: "",
        areaRestriction: null,
      });
    },
    []
  );

  useEffect(() => {
    if (token !== authController.token) {
      setToken(authController.token);
    }
  }, [authController.token]);

  useEffect(() => {
    setFilter(cameraController?.filter);
  }, [cameraController?.filter]);

  const fetchData = useCallback(
    async ({ page, size, search }) => {
      if (token) {
        const areaRestrictionId = cameraController.filter.areaRestriction
          ? filter?.areaRestriction?.id
          : "";
        const status = cameraController.filter.status
          ? filter?.status === "Đã xóa"
            ? "deleted"
            : "active"
          : "";
        const locationId = cameraController.locationChoosed
          ? cameraController.locationChoosed.id
          : isTimeKeepingModule()
          ? ""
          : authController.currentUser.location.id;
        const getAllCamerasResponse = await getAllCameraApi({
          token: authController.token,
          page,
          size,
          search,
          areaRestrictionId,
          locationId,
          status,
        });
        if (getAllCamerasResponse.data !== null) {
          getAllCameraSuccess(cameraDispatch, getAllCamerasResponse.data.data);
          setPageCount(getAllCamerasResponse.data.pageCount);
          setItemCount(getAllCamerasResponse.data.itemCount);
        }
      }
    },
    [token, cameraController.locationChoosed, filter]
  );

  const convertDataToRow = (camera: Camera) => ({
    cameraName: convertEllipsisCharacter(camera?.name, STRING_MAX_LENGTH),
    location: isTimeKeepingModule()
      ? camera.location
        ? convertEllipsisCharacter(camera?.location?.name, STRING_MAX_LENGTH)
        : `Không có chi nhánh`
      : camera.areaRestriction
      ? convertEllipsisCharacter(camera?.areaRestriction?.areaName, STRING_MAX_LENGTH)
      : `Không có`,
    ipAddress: convertEllipsisCharacter(camera.ipAddress, STRING_MAX_LENGTH),
    typeCamera: camera.type,
    setting:
      camera.status === "active" ? (
        <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
          <MDButton variant="text" color="info" onClick={() => handleSetting(camera)}>
            <Icon>settings</Icon>
            &nbsp;Cài đặt
          </MDButton>
        </MDBox>
      ) : (
        <div />
      ),
    status: convertStatusToString(camera.status),
    action:
      camera.status === "active" ? (
        <RowAction
          handleView={() => handleView(camera)}
          handleEdit={() => handleEdit(camera)}
          handleDelete={() => handleDelete(camera)}
        />
      ) : (
        <div />
      ),
  });

  useEffect(() => {
    if (cameraController.cameras) {
      setRowTableData(cameraController.cameras.map((camera: Camera) => convertDataToRow(camera)));
    }
  }, [cameraController.cameras]);

  return {
    columns: isTimeKeepingModule()
      ? [
          { Header: "Tên camera", accessor: "cameraName", align: "center" },
          { Header: "Chi nhánh", accessor: "location", align: "center" },
          { Header: "Link rtsp camera", accessor: "ipAddress", align: "center" },
          { Header: "Check in/Check out", accessor: "typeCamera", align: "center" },
          { Header: "Trạng thái", accessor: "status", align: "center" },
          { Header: "Thao tác", accessor: "action", align: "center" },
        ]
      : [
          { Header: "Tên camera", accessor: "cameraName", align: "center" },
          { Header: "Khu vực hạn chế", accessor: "location", align: "center" },
          { Header: "Link rtsp camera", accessor: "ipAddress", align: "center" },
          { Header: "Cài đặt camera", accessor: "setting", align: "center" },
          { Header: "Trạng thái", accessor: "status", align: "center" },
          { Header: "Thao tác", accessor: "action", align: "center" },
        ],
    rows: rowTableDatas,
    fetchData,
    pageCount,
    itemCount,
  };
}
