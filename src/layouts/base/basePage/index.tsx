import React, { useState } from "react";
import DashboardTable from "components/customizes/DashboardTable";
import DeleteConfirm from "components/customizes/Form/DeleteConfirm";
import {
  AREA_RESTRICTION_TABLE_TITLE,
  CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE,
  CAMERA_ORDER_CONFIG_LOCAL_STORAGE,
  CAMERA_TABLE_TITLE,
  DELETE_CONFIRM_CONTENT,
  DELETE_CONFIRM_TITLE,
  DELETE_SUCCESS,
  DELETE_TYPE,
  EDIT_TYPE,
  EMPLOYEE_TABLE_TITLE,
  ERROR_TYPE,
  LOCATIONS_TABLE_TITLE,
  ORGANIZATION_TABLE_TITLE,
  SETTING_TYPE,
  SUCCESS_TYPE,
  USER_TABLE_TITLE,
  VIEW_IMAGE_TYPE,
  VIEW_TYPE,
} from "constants/app";
import { Modal } from "@mui/material";
import { showSnackbar, useSnackbarController } from "context/snackbarContext";
import { ApiResponse } from "../../../types/apiResponse";
import { useAuthenController } from "../../../context/authenContext";
import { Employee } from "../../../models/base/employee";

type Props = {
  tableTitle: string;
  tableData: ({
    handleView,
    handleEdit,
    handleDelete,
    handleSetting,
    handleViewImageDetails,
  }: {
    handleView: (item: any) => void;
    handleEdit: (item: any) => void;
    handleDelete: (item: any) => void;
    handleSetting: (item: any) => void;
    handleViewImageDetails: (item: any) => void;
  }) => {
    columns: any;
    rows: any;
    fetchData?: ({
      page,
      size,
      search,
    }: {
      page: number;
      size: number;
      search: string;
    }) => Promise<void>;
    pageCount?: number;
    itemCount?: number;
  };
  AddForm?: ({ handleClose }: { handleClose: Function }) => React.ReactElement;
  EditForm?: ({ handleClose, item }: { handleClose: Function; item: any }) => React.ReactElement;
  ViewForm?: ({ handleClose, item }: { handleClose: Function; item: any }) => React.ReactElement;
  SettingForm?: ({ handleClose, item }: { handleClose: Function; item: any }) => React.ReactElement;
  ViewImageDetailsForm?: ({
    handleClose,
    item,
    dataEmployees,
  }: {
    handleClose: Function;
    item: any;
    dataEmployees: Employee[];
  }) => React.ReactElement;
  ImportForm?: () => React.ReactElement;
  ExportForm?: () => React.ReactElement;
  ExpandForm?: () => React.ReactElement;
  FilterForm?: (pageSize: number, search: string) => React.ReactElement;

  deleteAction?: {
    actionDelete: (id: number) => {};
    deleteApi: ({ token, id }: { token: string; id: number }) => Promise<ApiResponse>;
  };

  optionFeature: {
    enableCreate: boolean;
    enableImport: boolean;
    enableExport: boolean;
    enableExpand?: boolean;
    enableSearch?: boolean;
  };
  isCustomTable?: boolean;
};

function BasePage({
  tableTitle,
  tableData,
  AddForm = () => <div />,
  EditForm = () => <div />,
  ViewForm = () => <div />,
  SettingForm = () => <div />,
  ViewImageDetailsForm = () => <div />,
  ImportForm = () => <div />,
  ExportForm = () => <div />,
  ExpandForm = () => <div />,
  FilterForm = (pageSize: number, search: string) => <div />,
  deleteAction,
  optionFeature,
  isCustomTable = false,
}: Props): React.ReactElement {
  const [open, setOpen] = useState(false);

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();
  const [itemChoosed, setItemChoosed] = useState<any>(null);
  const [actionType, setActionType] = useState("");

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (item: any) => {
    setOpen(true);
    setItemChoosed(item);
    setActionType(EDIT_TYPE);
  };

  const handleDelete = (item: any) => {
    setOpen(true);
    setItemChoosed(item);
    setActionType(DELETE_TYPE);
  };

  const handleView = (item: any) => {
    setOpen(true);
    setItemChoosed(item);
    setActionType(VIEW_TYPE);
  };

  const handleSetting = (item: any) => {
    setOpen(true);
    setItemChoosed(item);
    setActionType(SETTING_TYPE);
  };

  const handleViewImageDetails = (item: any) => {
    setOpen(true);
    setItemChoosed(item);
    setActionType(VIEW_IMAGE_TYPE);
  };

  const setDataLocalStore = (nameStore: string, dataSet: any) => {
    localStorage.setItem(nameStore, JSON.stringify(dataSet));
  };

  const confirmDelete = async () => {
    if (itemChoosed && deleteAction !== undefined) {
      const deleteResponse = await deleteAction.deleteApi({
        token: authController.token,
        id: itemChoosed.id,
      });
      if (deleteResponse.data !== null) {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: DELETE_SUCCESS,
        });
        handleClose();
        deleteAction.actionDelete(itemChoosed.id);
        // eslint-disable-next-line array-callback-return
        const dataCameraChecked = JSON.parse(
          localStorage.getItem(
            CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module")
          ) || "{}"
        );
        const dataCameraNew = JSON.parse(
          localStorage.getItem(
            CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE + localStorage.getItem("module")
          ) || "{}"
        );
        if (dataCameraChecked?.length > 0) {
          const cameraCheckedDelete = dataCameraChecked?.filter(
            // eslint-disable-next-line no-shadow
            (item: { camera: number }) => item?.camera !== itemChoosed?.id
          );
          setDataLocalStore(
            CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module"),
            cameraCheckedDelete
          );
        }
        if (dataCameraNew?.length > 0) {
          const cameraNewDelete = dataCameraNew?.filter(
            // eslint-disable-next-line no-shadow
            (item: { id: number }) => item?.id !== itemChoosed?.id
          );
          setDataLocalStore(
            CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE + localStorage.getItem("module"),
            cameraNewDelete
          );
        }
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: deleteResponse.messageError,
        });
      }
    }
  };

  const formCreate = (closeFormCreate: Function) => <AddForm handleClose={closeFormCreate} />;
  const formEdit = (closeFormEdit: Function) => {
    if (itemChoosed !== null) {
      return <EditForm handleClose={closeFormEdit} item={itemChoosed} />;
    }
    return <div />;
  };
  // eslint-disable-next-line consistent-return
  const renderUsernameDelete = () => {
    const deleteItemChoosed: any = itemChoosed;
    switch (tableTitle) {
      case CAMERA_TABLE_TITLE:
        return deleteItemChoosed?.name;
      case EMPLOYEE_TABLE_TITLE:
        return deleteItemChoosed?.name;
      case AREA_RESTRICTION_TABLE_TITLE:
        return deleteItemChoosed?.areaName;
      case ORGANIZATION_TABLE_TITLE:
        return deleteItemChoosed?.name;
      case USER_TABLE_TITLE:
        return deleteItemChoosed?.fullName;
      case LOCATIONS_TABLE_TITLE:
        return deleteItemChoosed?.name;
      default:
        return "Loading...";
    }
  };
  const formDeleteConfirm = (closeDeleteConfirm: Function) => (
    <DeleteConfirm
      title={DELETE_CONFIRM_TITLE}
      handleConfirmDelete={confirmDelete}
      handleClose={closeDeleteConfirm}
    >
      <p>{`"${renderUsernameDelete()}" ${DELETE_CONFIRM_CONTENT}`}</p>
    </DeleteConfirm>
  );

  const formView = (closeView: Function) => {
    if (itemChoosed !== null) {
      return <ViewForm handleClose={closeView} item={itemChoosed} />;
    }
    return <div />;
  };

  const formSetting = (closeSetting: Function) => {
    if (itemChoosed !== null) {
      return <SettingForm handleClose={closeSetting} item={itemChoosed} />;
    }
    return <div />;
  };

  const formImageDetails = (closeForm: Function) => {
    if (itemChoosed !== null) {
      return (
        <ViewImageDetailsForm handleClose={closeForm} item={itemChoosed} dataEmployees={rows} />
      );
    }
    return <div />;
  };

  const showModalContent = () => {
    if (actionType === VIEW_TYPE) return formView(handleClose);
    if (actionType === EDIT_TYPE) return formEdit(handleClose);
    if (actionType === DELETE_TYPE) return formDeleteConfirm(handleClose);
    if (actionType === SETTING_TYPE) return formSetting(handleClose);
    if (actionType === VIEW_IMAGE_TYPE) return formImageDetails(handleClose);
    return <div />;
  };

  const { columns, rows, fetchData, pageCount, itemCount } = tableData({
    handleView,
    handleEdit,
    handleDelete,
    handleSetting,
    handleViewImageDetails,
  });
  return (
    <div key={tableTitle}>
      <DashboardTable
        tableTitle={tableTitle}
        columns={columns}
        rows={rows}
        formCreate={formCreate}
        formImport={ImportForm}
        formExport={ExportForm}
        formExpand={ExpandForm}
        enableCreate={optionFeature.enableCreate}
        enableImport={optionFeature.enableImport}
        enableExport={optionFeature.enableExport}
        enableExpand={optionFeature.enableExpand}
        enableSearch={optionFeature.enableSearch}
        isCustomTable={isCustomTable}
        fetchData={fetchData}
        pageCount={pageCount}
        itemCount={itemCount}
        formFilter={FilterForm}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>{showModalContent()}</>
      </Modal>
    </div>
  );
}

export default BasePage;
