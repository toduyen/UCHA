import { Icon } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDButton from "components/bases/MDButton";
import { useCallback, useEffect, useState } from "react";
import { getAllAreaRestrictionApi } from "../api";
import {
  getAllAreaRestrictionSuccess,
  useAreaRestrictionController,
} from "../../../../context/areaRestrictionContext";
import { AreaRestriction } from "models/area-restriction/areaRestriction";
import { useAuthenController } from "../../../../context/authenContext";
import RowAction from "../../../../components/customizes/Tables/RowAction";
import { AcionType } from "../../../../types/actionType";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_MAX_LENGTH, STRING_SHORT_LENGTH } from "../../../../constants/app";

export default function data({ handleView, handleEdit, handleDelete, handleSetting }: AcionType) {
  const [areaRestrictionData, setAreaRestrictionData] = useState<Array<any>>([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [areaRestrictionController, areaRestrictionDispatch] = useAreaRestrictionController();

  const [token, setToken] = useState(null);

  useEffect(() => {
    if (token !== authController.token) {
      setToken(authController.token);
    }
  }, [authController.token]);

  const fetchData = useCallback(
    async ({ page, size, search }) => {
      if (token) {
        const getAllAreaRestrictionResponse = await getAllAreaRestrictionApi({
          token,
          page,
          size,
          search,
        });

        if (getAllAreaRestrictionResponse.data !== null) {
          getAllAreaRestrictionSuccess(
            areaRestrictionDispatch,
            getAllAreaRestrictionResponse.data.data
          );
          setPageCount(getAllAreaRestrictionResponse.data.pageCount);
          setItemCount(getAllAreaRestrictionResponse.data.itemCount);
        }
      }
    },
    [token]
  );

  const convertDataToRow = (areaRestriction: AreaRestriction) => ({
    areaName: convertEllipsisCharacter(areaRestriction?.areaName, STRING_SHORT_LENGTH),
    areaCode: convertEllipsisCharacter(areaRestriction?.areaCode, STRING_SHORT_LENGTH),
    personnelAllowedInOut: areaRestriction.personnelAllowedInOut
      ? areaRestriction.personnelAllowedInOut
      : "0",
    personnelInCharge: (
      <MDBox>
        {areaRestriction.personnelInCharge?.map((item, index) => (
          <MDBox key={index} style={{ display: "flex" }}>
            {convertEllipsisCharacter(item.name, STRING_MAX_LENGTH)}
          </MDBox>
        ))}
      </MDBox>
    ),
    theTimeAllowed: `${areaRestriction.timeStart} - ${areaRestriction.timeEnd}`,
    numberCamera: areaRestriction.numberCamera ? areaRestriction.numberCamera : "0",
    numberOfAlertsForTheDay: areaRestriction.numberOfAlertsForTheDay
      ? areaRestriction.numberOfAlertsForTheDay
      : "0",
    setting: (
      <MDBox display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }} ml={{ xs: -1.5, sm: 0 }}>
        <MDButton variant="text" color="info" onClick={() => handleSetting(areaRestriction)}>
          <Icon fontSize="small">settings</Icon>
          &nbsp;cài đặt
        </MDButton>
      </MDBox>
    ),
    action: (
      <RowAction
        handleView={() => handleView(areaRestriction)}
        handleEdit={() => handleEdit(areaRestriction)}
        handleDelete={() => handleDelete(areaRestriction)}
      />
    ),
  });

  useEffect(() => {
    if (areaRestrictionController.areaRestrictions !== null) {
      setAreaRestrictionData(
        areaRestrictionController.areaRestrictions.map((areaRestriction: AreaRestriction) =>
          convertDataToRow(areaRestriction)
        )
      );
    }
  }, [areaRestrictionController.areaRestrictions]);

  return {
    columns: [
      { Header: "Tên khu vực", accessor: "areaName", align: "center" },
      { Header: "Mã khu vực", accessor: "areaCode", align: "center" },
      { Header: "Số nhân sự được phép vào ra", accessor: "personnelAllowedInOut", align: "center" },
      { Header: "Nhân sự phụ trách", accessor: "personnelInCharge", align: "left" },
      { Header: "Thời gian cho phép", accessor: "theTimeAllowed", align: "center" },
      { Header: "Số camera", accessor: "numberCamera", align: "center" },
      { Header: "Số cảnh báo trong ngày", accessor: "numberOfAlertsForTheDay", align: "center" },
      { Header: "Cài đặt cảnh báo", accessor: "setting", align: "center" },
      { Header: "Thao tác", accessor: "action", align: "center" },
    ],

    rows: areaRestrictionData,
    fetchData,
    pageCount,
    itemCount,
  };
}
