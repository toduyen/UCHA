import MDBox from "components/bases/MDBox";
import FormInfo from "components/customizes/Form/FormInfo";
import { useEffect, useState } from "react";
import {
  getAllAreaRestrictionNotificationSuccess,
  updateAreaRestrictionNotificationSuccess,
} from "context/areaRestrictionContext";
import { getAllAreaRestrictionNotificationApi, updateAreaRestrictionMethodApi } from "../api";
import { AreaRestrictionNotification } from "models/area-restriction/areaRestrictionNotification";
import { ERROR_TYPE, SUCCESS_TYPE } from "constants/app";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { useAuthenController } from "../../../../context/authenContext";
import AreaRestrictionNotificationComponent from "./component/AreaRestrictionNotificationComponent";
import AreaRestrictionManagerComponent from "./component/AreaRestrictionManagerComponent";
import { AreaRestriction } from "../../../../models/area-restriction/areaRestriction";
import { useAreaRestrictionNotificationController } from "../../../../context/areaRestrictionNotificationContext";
import { NotificationMethod } from "../../../../models/base/notificationMethod";
import { Button, Modal, Tooltip } from "@mui/material";
import { AreaSettingReportType } from "types/areaSetingReport";
import { ManagerTimeSkip } from "models/area-restriction/managerTimeSkip";
import MDButton from "components/bases/MDButton";
import QrCodeComponent from "components/customizes/QrCodeComponent";
import {
  updateHasNotificationAudio,
  useNotificationHistoryController,
} from "../../../../context/notificationHistoryContext";
import { isValidTimeNotification } from "../../../../utils/helpers";

const initAreaSettingReportTime: AreaSettingReportType = {
  staff: null,
  timeReport: null,
};

function SettingFormAreaRestriction({
  handleClose,
  areaRestriction,
}: {
  handleClose: any;
  areaRestriction: AreaRestriction;
}) {
  const [areaRestrictionNotification, setAreaRestrictionNotification] =
    useState<AreaRestrictionNotification | null>(null);
  const [rowsData, setRowData] = useState<Array<AreaSettingReportType>>([]);
  const [open, setOpen] = useState(false);
  const [conditionUpdate, setConditionUpdate] = useState<boolean>(true);
  // @ts-ignore
  const [notificationHistoryController, notificationHistoryDispatch] =
    useNotificationHistoryController();

  const handleCloseQrCodeForm = () => {
    setOpen(false);
  };

  // @ts-ignore
  const [authController] = useAuthenController();

  // @ts-ignore
  const [areaRestrictionNotificationController, areaRestrictionNotificationDispatch] =
    useAreaRestrictionNotificationController();

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const handleChangeNotificationMethod = (newNotificationMethod: NotificationMethod) => {
    if (areaRestrictionNotification) {
      areaRestrictionNotification.notificationMethod = newNotificationMethod;
      setAreaRestrictionNotification((prevState) => {
        if (prevState) {
          return {
            ...prevState,
            notificationMethod: newNotificationMethod,
          };
        }
        return null;
      });
    }
  };

  const convertAreaSettingReport = (): Array<AreaSettingReportType> =>
    areaRestrictionNotification?.managers
      ? areaRestrictionNotification.managers.map((item: any) => ({
          staff: item.manager,
          timeReport: item.timeSkip,
        }))
      : [];

  const handleAddReportStaff = () => {
    setRowData((prevState: any) => [...prevState, initAreaSettingReportTime]);
  };
  const [notificationDefault, setNotificationDefault] = useState<any>(null);
  // @ts-ignore
  useEffect(async () => {
    const getAllAreaRestrictionNotificationResponse = await getAllAreaRestrictionNotificationApi({
      token: authController.token,
      id: areaRestriction.id,
    });
    if (getAllAreaRestrictionNotificationResponse.data !== null) {
      getAllAreaRestrictionNotificationSuccess(
        areaRestrictionNotificationDispatch,
        getAllAreaRestrictionNotificationResponse.data
      );
      setNotificationDefault(getAllAreaRestrictionNotificationResponse.data?.notificationMethod);
      setAreaRestrictionNotification(getAllAreaRestrictionNotificationResponse.data);
    }
  }, [authController.token]);

  useEffect(() => {
    if (areaRestrictionNotification) {
      setRowData(convertAreaSettingReport());
    }
  }, [areaRestrictionNotification?.managers]);

  const handleUpdateReport = (index: number, newValue: AreaSettingReportType | null) => {
    const rowsDataTmp = [...rowsData];
    if (!newValue) {
      rowsDataTmp.splice(index, 1);
    } else {
      rowsDataTmp[index] = newValue;
    }
    setRowData(rowsDataTmp);
  };
  const convertAreaReport = (): Array<ManagerTimeSkip> => {
    const result: Array<ManagerTimeSkip> = [];
    rowsData.forEach((item: AreaSettingReportType) => {
      const time = item.timeReport;
      result.push({
        manager: item.staff,
        timeSkip: time,
      });
    });
    return result;
  };

  const isValid = (time: any) => {
    let checkValid = true;
    if (!isValidTimeNotification(time)) {
      checkValid = false;
    }
    return checkValid;
  };

  const handleChangeSetting = async () => {
    setConditionUpdate(false);
    const newARNotification = { ...areaRestrictionNotification, managers: convertAreaReport() };
    const checkField = () => {
      let statusUpdate = true;
      newARNotification.managers.forEach((item: any) => {
        if (
          item.manager === null ||
          item.timeSkip === null ||
          item.timeSkip === "" ||
          item.timeSkip <= 0 ||
          item.timeSkip > 999 ||
          !isValid(item.timeSkip)
        ) {
          statusUpdate = false;
        }
      });
      return statusUpdate;
    };
    if (checkField()) {
      const settingAreaRestrictionResponse = await updateAreaRestrictionMethodApi({
        token: authController.token,
        // @ts-ignore
        areaRestrictionNotification: newARNotification,
      });

      if (settingAreaRestrictionResponse.data !== null) {
        updateAreaRestrictionNotificationSuccess(
          areaRestrictionNotificationDispatch,
          settingAreaRestrictionResponse.data
        );
        handleClose();
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: settingAreaRestrictionResponse.messageError,
        });

        // Alarm when update from off to on audio
        updateHasNotificationAudio(
          notificationHistoryDispatch,
          areaRestrictionNotification?.notificationMethod.useRing
        );
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: settingAreaRestrictionResponse.messageError,
        });
      }
    }
  };

  useEffect(() => {
    setAreaRestrictionNotification(
      areaRestrictionNotificationController.areaRestrictionNotification
    );
  }, [areaRestrictionNotificationController.areaRestrictionNotification]);

  const formQrCode = (closeView: Function) => <QrCodeComponent handleClose={closeView} />;
  const dataEmployeeDefault = () => ({
    managers: areaRestrictionNotificationController?.areaRestrictionNotification?.managers,
    notificationMethod: notificationDefault,
  });

  const isDataChange = () => {
    const dataEmployee = dataEmployeeDefault();
    const dataAfter = {
      managers: convertAreaReport(),
      notificationMethod: areaRestrictionNotification?.notificationMethod,
    };
    return JSON.stringify(dataEmployee) !== JSON.stringify(dataAfter);
  };

  return (
    <FormInfo
      title="Cài đặt cảnh báo"
      handleClose={handleClose}
      enableUpdate
      handleUpdate={handleChangeSetting}
      showConfirmClose={isDataChange()}
    >
      <>
        <MDBox style={{ overflowY: "auto", maxHeight: "500px" }}>
          <MDBox display="flex" flexDirection="column">
            <MDBox display="flex" flexDirection="column" lineHeight="28px">
              {areaRestrictionNotification !== null && (
                <AreaRestrictionNotificationComponent
                  notificationMethod={areaRestrictionNotification?.notificationMethod}
                  handleChange={(newNotificationMethod) =>
                    handleChangeNotificationMethod(newNotificationMethod)
                  }
                />
              )}
              {areaRestrictionNotification !== null && (
                <AreaRestrictionManagerComponent
                  areaRestriction={areaRestrictionNotification?.areaRestriction}
                  rowsData={rowsData}
                  handleUpdateReport={handleUpdateReport}
                  conditionUpdate={conditionUpdate}
                />
              )}
            </MDBox>
          </MDBox>
          <Button
            onClick={handleAddReportStaff}
            style={{
              padding: "0",
              fontWeight: "400",
              fontSize: "12px",
              textTransform: "initial",
              margin: "24px",
            }}
          >
            Thêm cảnh báo
          </Button>
        </MDBox>
        {areaRestrictionNotification?.notificationMethod?.useOTT && (
          <Tooltip title="Chia sẻ mã QR tới mail của các nhân sự, nhân sự có thể quét mã để sử dụng OTT">
            <MDButton
              variant="gradient"
              color="dark"
              style={{ marginBottom: "-24px" }}
              fullWidth
              onClick={() => {
                setOpen(true);
              }}
            >
              Chia sẻ mã QR OTT
            </MDButton>
          </Tooltip>
        )}
        <Modal
          open={open}
          onClose={handleCloseQrCodeForm}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <>{formQrCode(handleCloseQrCodeForm)}</>
        </Modal>
      </>
    </FormInfo>
  );
}

export default SettingFormAreaRestriction;
