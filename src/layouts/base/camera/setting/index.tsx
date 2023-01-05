import { Camera } from "models/base/camera";
import MDBox from "components/bases/MDBox";
import MDButton from "components/bases/MDButton";
import { POLYGON_SIZE, POLYGON_TYPE } from "react-draw-polygons";
import React, { useEffect, useRef, useState } from "react";
import { Grid } from "@mui/material";
// @ts-ignore
import rectangle from "assets/images/square-outline-xxl.png";
// @ts-ignore
import hexagon from "assets/images/hexagon-outline-xxl.png";
// @ts-ignore
import octxagon from "assets/images/octagon-outline-xxl.png";
import FormUpdateCameraAreaRestriction from "./components/FormUpdateCameraAreaRestriction";
import { updatePolygonsCameraApi } from "../api";
import { useAuthenController } from "../../../../context/authenContext";
import { showSnackbar, useSnackbarController } from "../../../../context/snackbarContext";
import { ERROR_TYPE, SUCCESS_TYPE } from "../../../../constants/app";
import { Point, PolygonType } from "../../../../types/polygonType";
import { useTour } from "@reactour/tour";
// @ts-ignore
import { Getter } from "../../../../components/customizes/ScriptTour/StateTour/Getter";
// @ts-ignore
import { Setter } from "../../../../components/customizes/ScriptTour/StateTour/Setter";
import OpenViewCamera from "../components/OpenViewCamera";

function SettingFormCamera({ handleClose, camera }: { handleClose: any; camera: Camera }) {
  const canvasRef = useRef();
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const [defaultPolygons, setDefaultPolygons] = useState<string | undefined>(undefined);

  const { setIsOpen } = useTour();

  const ref = useRef(null);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const newWidth = Math.round((((window.innerWidth * 9) / 12) * 10) / 12);
    const newHeight = Math.round((newWidth * 9) / 16);
    setWidth(newWidth);
    setHeight(newHeight);
    if (Getter()?.STATUS_CAMERA === true) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    if (camera.polygons && camera.polygons.trim() !== "") {
      setDefaultPolygons(camera.polygons);
    } else {
      setDefaultPolygons("[]");
    }
  }, []);

  const handleUpdate = async () => {
    if (authController.token) {
      // @ts-ignore
      const polygons: Array<PolygonType> = canvasRef.current.onConfirm();
      // @ts-ignore
      const newWidth = Math.round(ref.current.offsetWidth - 12);
      const newHeight = Math.round((newWidth * 9) / 16);
      // Camera has 1280*720
      const tmp = polygons.map(
        (polygon: PolygonType) =>
          `[${polygon.polygon.map((point: Point) => {
            const x =
              point.x < 0 ? 0 : point.x > newWidth ? 1280 : Math.round((point.x * 1280) / newWidth);
            const y =
              point.y < 0 ? 0 : point.y > newHeight ? 720 : Math.round((point.y * 720) / newHeight);
            return `[${x},${y}]`;
          })}]`
      );
      const updatePolygonCameraResponse = await updatePolygonsCameraApi({
        token: authController.token,
        id: camera.id,
        polygons: `[${tmp}]`,
      });

      if (updatePolygonCameraResponse.data !== null) {
        camera.polygons = `[${tmp}]`;
        showSnackbar(snackbarDispatch, {
          typeSnackbar: SUCCESS_TYPE,
          messageSnackbar: "Cập nhật vùng hạn chế thành công",
        });
      } else {
        showSnackbar(snackbarDispatch, {
          typeSnackbar: ERROR_TYPE,
          messageSnackbar: updatePolygonCameraResponse.messageError,
        });
      }
    }
  };
  const handleDrawRec = () => {
    // @ts-ignore
    canvasRef.current.onDraw({ type: POLYGON_TYPE.rec, size: POLYGON_SIZE.normal });
  };

  const handleDrawHex = () => {
    // @ts-ignore
    canvasRef.current.onDraw({ type: POLYGON_TYPE.hex, size: POLYGON_SIZE.normal });
  };

  const handleDrawOct = () => {
    // @ts-ignore
    canvasRef.current.onDraw({ type: POLYGON_TYPE.oct, size: POLYGON_SIZE.normal });
  };

  const handleDrawFree = () => {
    // @ts-ignore
    canvasRef.current.toggleDraw();
  };

  return (
    <FormUpdateCameraAreaRestriction
      title="Cập nhật vùng hạn chế"
      handleClose={handleClose}
      handleSaveData={() => handleUpdate()}
    >
      <MDBox style={{ maxHeight: "670px", lineHeight: 0 }}>
        <Grid container spacing={1}>
          <Grid item xs={10} md={10} lg={10} xl={10} data-tut="setting__camera4" ref={ref}>
            {width > 0 && Getter()?.STATUS_CAMERA === false ? (
              <OpenViewCamera
                handlePlay={() => {}}
                handlePause={() => {}}
                pause={false}
                cameraName={camera?.name}
                camId={camera?.id}
                areaRestriction={camera?.areaRestriction?.areaName}
                canvasRef={canvasRef}
                defaultPolygons={defaultPolygons}
                canEdit={true}
              />
            ) : (
              <MDBox />
            )}
          </Grid>

          <Grid item xs={2} md={2} lg={2} xl={2}>
            <MDBox
              style={{
                background: "#FFFFFF",
                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.25)",
                display: "flex",
                flexFlow: "column",
                height: "calc(100% - 6px)",
                borderRadius: "12px",
                justifyContent: "space-around",
              }}
              data-tut="setting__camera1"
            >
              <MDBox style={{ justifyContent: "center", display: "flex" }}>Công cụ</MDBox>
              <MDBox data-tut="setting__camera2">
                <MDButton onClick={handleDrawRec} mt={3}>
                  <img src={rectangle} alt="rectangle" width="60%" />
                </MDButton>
                <MDButton onClick={handleDrawHex} mt={3}>
                  <img src={hexagon} alt="hexagon" width="60%" />
                </MDButton>
                <MDButton onClick={handleDrawOct}>
                  <img src={octxagon} alt="octxagon" width="60%" />
                </MDButton>
              </MDBox>
              <MDButton data-tut="setting__camera3" onClick={handleDrawFree}>
                Vẽ tự do
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </FormUpdateCameraAreaRestriction>
  );
}

export default SettingFormCamera;
