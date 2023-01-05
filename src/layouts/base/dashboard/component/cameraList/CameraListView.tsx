import { Checkbox, CircularProgress, Grid } from "@mui/material";
import {
  CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE,
  CAMERA_LIST_ID_LOCAL_STORAGE,
  CAMERA_ORDER_CONFIG_LOCAL_STORAGE,
  CAMERA_STARTED_LOCAL_STORAGE,
  MAX_NUMBER_CAM_SHOW,
} from "constants/app";
import { Camera } from "models/base/camera";
import React, { useCallback, useEffect, useState } from "react";
import CameraOrderItems from "./CameraOrderItem";
import FormViewCamera from "./FormViewCamera";
import MDBox from "components/bases/MDBox";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuthenController } from "../../../../../context/authenContext";
import { getAllCameraApi } from "../../../camera/api";
import { useTour } from "@reactour/tour";
// @ts-ignore
// import "react-beautiful-dnd";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { addCameraListIdSuccess, useCameraController } from "../../../../../context/cameraContext";

function FormCamera({ handleClose }: { handleClose: any }) {
  const [orderIndexList, setOrderIndexList] = useState<Array<number>>([]);
  const [cameraList, setCameraList] = useState<Array<Camera>>([]);
  const [isDisableCheckbox, setIsDisableCheckbox] = useState<boolean>(true);
  const listItemChecked: Array<any> = [];
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [token, setToken] = useState(null);
  const [isCheckAll, setIsCheckAll] = useState<boolean | null>(null);
  const [tempCameraList, setTempCameraList] = useState<Array<Camera>>([]);
  const { setCurrentStep } = useTour();
  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [, dispatch] = useCameraController();

  useEffect(() => {
    if (authController.token) {
      setToken(authController.token);
    }
  }, [authController.token]);

  // Save to local storage for drag and drop
  const saveDataForDnD = (nameStore: string, stateOrigin: any) => {
    localStorage.setItem(nameStore + localStorage.getItem("module"), JSON.stringify(stateOrigin));
  };
  const handleSaveData = () => {
    // Loop orderIndexList if item > 0 => add in result array : {came, orderIndex}
    orderIndexList.forEach((item: number, index: number) => {
      if (item > 0) {
        listItemChecked.push({
          camera: cameraList[index].id,
          orderIndex: item,
        });
      }
    });
    // Order result array to asc orderIndex
    listItemChecked.sort((a, b) => a.orderIndex - b.orderIndex);

    const newCameraStartedArray: Array<number> = listItemChecked.map((element) => element.camera);
    if (newCameraStartedArray.length === 0) {
      localStorage.removeItem(CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module"));
    } else {
      localStorage.setItem(
        CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module"),
        JSON.stringify(newCameraStartedArray)
      );
    }
    localStorage.setItem(
      CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module"),
      JSON.stringify(listItemChecked)
    );
    // create store save orderIndex and camera
    saveDataForDnD(
      CAMERA_LIST_ID_LOCAL_STORAGE + localStorage.getItem("module"),
      cameraList.map((item) => item.id)
    );
    // ------------->>context camera list
    addCameraListIdSuccess(
      dispatch,
      cameraList.map((item: Camera) => item?.id)
    );
    handleClose();
  };

  const handleUpdateIndex = (newIndex: number, newOrderIndex: number) => {
    if (
      orderIndexList.filter((item) => item > 0).length < parseInt(MAX_NUMBER_CAM_SHOW, 10) ||
      newOrderIndex === 0
    ) {
      // Re update orderIndexList
      orderIndexList[newIndex] = newOrderIndex;
    } else if (orderIndexList[newIndex] > 0) {
      orderIndexList[newIndex] = newOrderIndex;
    }
    setOrderIndexList(orderIndexList);
    setIsDisableCheckbox(
      orderIndexList.filter((item) => item > 0).length >= parseInt(MAX_NUMBER_CAM_SHOW, 10)
    );
  };

  const sortListCamera = (array: any, sortArray: string | any[]) => {
    const dataListLocalStore = localStorage.getItem(
      CAMERA_LIST_ID_LOCAL_STORAGE + localStorage.getItem("module")
    );
    const ax = [...array]?.sort((a, b) => sortArray.indexOf(a.id) - sortArray.indexOf(b.id));
    if (dataListLocalStore) {
      // ----------->> setItem sau khi luu
      // @ts-ignore
      const getItemNewLocal = JSON.parse(localStorage.getItem(CAMERA_LIST_ID_LOCAL_STORAGE));
      // eslint-disable-next-line no-unsafe-optional-chaining
      const getItemNew = array?.length - getItemNewLocal?.length;
      if (getItemNew > 0) {
        return ax?.concat(ax?.splice(0, getItemNew));
      }
    }
    return ax;
  };

  const fetchData = useCallback(
    async ({ page, size, search, reset = false }) => {
      if (token) {
        const getAllCameraResponse = await getAllCameraApi({
          token,
          page,
          size,
          search,
          status: "active",
        });
        if (getAllCameraResponse.data !== null) {
          if (reset) {
            setCameraList(getAllCameraResponse.data.data);
            setTempCameraList(getAllCameraResponse.data.data);
          } else {
            setCameraList((prevState) => [...prevState, ...getAllCameraResponse.data.data]);
            setTempCameraList((prevState) => [...prevState, ...getAllCameraResponse.data.data]);
          }
          setTotalPage(getAllCameraResponse.data.pageCount);
          const cameraOrderConfig = localStorage.getItem(
            CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module")
          );
          if (cameraOrderConfig !== null) {
            const cameraOrderConfigArray: Array<any> = JSON.parse(cameraOrderConfig);
            if (cameraOrderConfigArray.length === getAllCameraResponse.data.itemCount) {
              setIsCheckAll(true);
            }
          }
        }
      }
    },
    [token]
  );

  // @ts-ignore
  useEffect(async () => {
    if (isCheckAll === true) {
      setOrderIndexList(cameraList.map((item: any) => 1));
    } else {
      const cameraOrderConfig = localStorage.getItem(
        CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module")
      );
      if (cameraOrderConfig !== null) {
        const cameraOrderConfigArray: Array<any> = JSON.parse(cameraOrderConfig);
        const result: Array<number> = [];

        cameraList.forEach((element: Camera, index) => {
          if (index < orderIndexList.length) {
            result.push(orderIndexList[index]);
          } else {
            const resultFilterCamera = cameraOrderConfigArray.filter(
              (item: any) => item.camera === element.id
            );
            if (resultFilterCamera.length > 0) {
              result.push(resultFilterCamera[0].orderIndex);
            } else {
              result.push(0);
            }
          }
        });

        setOrderIndexList(result);
      } else {
        setOrderIndexList(cameraList.map((item: any) => 0));
      }
    }
  }, [cameraList, isCheckAll]);

  useEffect(() => {
    if (isCheckAll === true) {
      fetchData({ page: 0, size: 10 ** 6, reset: true }).catch(console.error);
    } else if (isCheckAll === false) {
      setOrderIndexList(cameraList.map((item: any) => 0));
    }
  }, [isCheckAll]);

  useEffect(() => {
    setIsDisableCheckbox(
      orderIndexList.filter((item) => item > 0).length >= parseInt(MAX_NUMBER_CAM_SHOW, 10)
    );
  }, [orderIndexList]);

  useEffect(() => {
    fetchData({ page: 0, size: 10 }).catch(console.error);
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const dataCameraListName = localStorage.getItem(
      CAMERA_LIST_ID_LOCAL_STORAGE + localStorage.getItem("module")
    );
    // checked
    const getCameraChecked = localStorage.getItem(
      CAMERA_ORDER_CONFIG_LOCAL_STORAGE + localStorage.getItem("module")
    );
    const dataCameraLocalStore = JSON.parse(dataCameraListName || "[]");
    // get camera new
    const getCameraNew = localStorage.getItem(
      CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE + localStorage.getItem("module")
    );
    const arrayCameraList: any[] = [];
    if (getCameraNew) {
      const dataCameraNew = JSON.parse(getCameraNew || "[]");
      const dataCamera = sortListCamera(dataCameraNew, dataCameraLocalStore);
      arrayCameraList.push(dataCamera);
    } else {
      const dataOldCamera = sortListCamera(cameraList, dataCameraLocalStore);
      arrayCameraList.push(dataOldCamera);
    }
    // const dataCameraId = sortListCamera(cameraList, dataCameraLocalStore);
    setCameraList(arrayCameraList[0]);
    // Array for camera id checked
    const cameraChecked: Array<number> = [];
    JSON.parse(getCameraChecked || "[]")?.forEach((item: any) => {
      cameraChecked.push(item.camera);
    });
    if (getCameraChecked !== null) {
      const arrayChecked: number[] = [];
      // eslint-disable-next-line array-callback-return
      arrayCameraList[0]?.map((item: any) => {
        if (cameraChecked.indexOf(item.id) > -1) {
          arrayChecked.push(1);
        } else {
          arrayChecked.push(0);
        }
      });
      setOrderIndexList(arrayChecked);
    }
  }, [tempCameraList]);
  // @ts-ignore
  const getUniqueListBy = (
    arr: {
      map: (arg0: (item: any) => any[]) => Iterable<readonly [unknown, unknown]> | null | undefined;
    },
    key: string | number
    // @ts-ignore
  ) => [...new Map(arr.map((item) => [item[key], item])).values()];

  // focus step 3
  useEffect(() => {
    if (cameraList?.length > 0) {
      setCurrentStep(3);
    }
    // detected scroll list camera
    if (cameraList?.length > 10) {
      // @ts-ignore
      localStorage.setItem(
        CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE + localStorage.getItem("module"),
        // @ts-ignore
        JSON.stringify(getUniqueListBy(cameraList, "id"))
      );
    }
  }, [cameraList]);

  const handleCheckAll = (event: any) => {
    setIsCheckAll(event.target.checked);
  };
  // func end drag
  const handleEndDrag = useCallback(
    (result: any, stateOrigin: any, Conditional: boolean) => {
      const newItems = Array.from(stateOrigin);
      if (result?.destination?.index !== undefined) {
        const [removed] = newItems.splice(result?.source?.index, 1);
        newItems.splice(result?.destination?.index, 0, removed);
        if (Conditional) {
          // @ts-ignore
          setCameraList(newItems);
          localStorage.setItem(
            CAMERA_LIST_ID_LOCAL_STORAGE + localStorage.getItem("module"),
            JSON.stringify(newItems?.map((item: any) => item?.id))
          );
        } else {
          // @ts-ignore
          setOrderIndexList(newItems);
        }
      }
    },
    [cameraList, orderIndexList]
  );

  const onDragEnd = (result: any) => {
    // state for cameraList
    handleEndDrag(result, cameraList, true);
    // state for orderIndexList
    handleEndDrag(result, orderIndexList, false);
  };
  return (
    <FormViewCamera
      title="Chọn camera hiển thị dashboard"
      handleClose={handleClose}
      handleSaveData={handleSaveData}
    >
      <MDBox data-tut="reactour__four">
        <Grid container mb={2}>
          <Grid item xs={4} md={4} lg={4}>
            <Checkbox
              checked={isCheckAll ? isCheckAll : false}
              onChange={(event) => handleCheckAll(event)}
              data-tut="reactour__five"
            />
          </Grid>
          <Grid item xs={8} md={8} lg={8}>
            Tên camera
          </Grid>
        </Grid>
        <div
          id="cameraListScroll"
          style={{ maxHeight: "55vh", overflowY: "auto", overflowX: "hidden" }}
          data-tut="reactour__six"
        >
          <InfiniteScroll
            dataLength={orderIndexList?.length}
            next={async () => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              await fetchData({ page: newPage, size: 10 });
            }}
            // hasMore: Boolean if is True show Progress or false hidden
            hasMore={
              cameraList?.length > 0 &&
              // @ts-ignore
              (localStorage.getItem(
                CAMERA_LIST_AFTER_SCROLL_LOCAL_STORAGE + localStorage.getItem("module")
              )?.length > 0
                ? false
                : currentPage < Math.abs(totalPage - 1))
            }
            loader={
              <MDBox style={{ display: "flex", justifyContent: "center", padding: "1em" }}>
                <CircularProgress color="info" />
              </MDBox>
            }
            scrollableTarget="cameraListScroll"
            style={{ overflowY: "hidden" }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided: any) => (
                  <div {...provided?.droppableProps} ref={provided?.innerRef}>
                    {orderIndexList?.map((item: number, index: number) => (
                      <Draggable
                        key={index?.toString()}
                        draggableId={index?.toString()}
                        index={index}
                        autoScroll={false}
                      >
                        {/* eslint-disable-next-line no-shadow */}
                        {(provided: any, snapshot: any) => (
                          <React.Fragment key={`${item}_${index}`}>
                            <CameraOrderItems
                              provided={provided}
                              snapshot={snapshot}
                              camera={cameraList[index]}
                              index={index}
                              orderIndex={item}
                              isDisableCheckbox={isDisableCheckbox}
                              handleUpdateIndex={handleUpdateIndex}
                            />
                          </React.Fragment>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </InfiniteScroll>
        </div>
      </MDBox>
    </FormViewCamera>
  );
}

export default FormCamera;
