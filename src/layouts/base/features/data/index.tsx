import { useCallback, useEffect, useState } from "react";
import { getAllFeaturesApi } from "../api";
import { Feature } from "models/base/feature";
import { isSuperAdmin } from "../../../../utils/checkRoles";
import { useAuthenController } from "../../../../context/authenContext";
import { getAllFeatureSuccess, useFeatureController } from "../../../../context/featureContext";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_MAX_LENGTH } from "../../../../constants/app";

export default function data() {
  const [featuresDatas, setFeaturesData] = useState([]);

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [featureController, featureDispatch] = useFeatureController();
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  // token
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (token !== authController.token) {
      setToken(authController.token);
    }
  }, [authController.token]);

  const fetchData = useCallback(
    // eslint-disable-next-line no-shadow
    async ({ page, size, search }) => {
      if (token) {
        const getAllFeaturesResponse = await getAllFeaturesApi({
          token,
          page,
          size,
          search,
        });
        if (getAllFeaturesResponse.data !== null) {
          getAllFeatureSuccess(featureDispatch, getAllFeaturesResponse.data.data);
          setPageCount(getAllFeaturesResponse.data.pageCount);
          setItemCount(getAllFeaturesResponse.data.itemCount);
        }
      }
    },
    [token]
  );

  const convertDataToRow = (feature: Feature) =>
    isSuperAdmin(authController.currentUser)
      ? {
          featuresName: convertEllipsisCharacter(feature?.name, STRING_MAX_LENGTH),
          accountUsed: feature.numberAccount,
          organizationUsed: feature.numberOrganization,
        }
      : { featuresName: feature.name, accountUsed: feature.numberAccount };

  useEffect(() => {
    if (featureController.features) {
      setFeaturesData(
        featureController.features.map((feature: Feature) => convertDataToRow(feature))
      );
    }
  }, [featureController.features]);

  useEffect(() => () => getAllFeatureSuccess(featureDispatch, []), []);
  return {
    columns: isSuperAdmin(authController.currentUser)
      ? [
          { Header: "T??n t??nh n??ng", accessor: "featuresName", align: "left" },
          { Header: "S??? t??i kho???n s??? d???ng", accessor: "accountUsed", align: "left" },
          { Header: "S??? t??? ch???c s??? d???ng", accessor: "organizationUsed", align: "left" },
        ]
      : [
          { Header: "T??n t??nh n??ng", accessor: "featuresName", align: "left" },
          { Header: "S??? t??i kho???n s??? d???ng", accessor: "accountUsed", align: "left" },
        ],

    rows: featuresDatas,
    fetchData,
    pageCount,
    itemCount,
  };
}
