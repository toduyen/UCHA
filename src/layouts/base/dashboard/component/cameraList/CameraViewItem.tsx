import React, { useEffect, useRef, useState } from "react";
import { Camera } from "../../../../../models/base/camera";
import { CAMERA_STARTED_LOCAL_STORAGE } from "../../../../../constants/app";
import { Grid } from "@mui/material";
import { useAuthenController } from "../../../../../context/authenContext";
import OpenViewCamera from "layouts/base/camera/components/OpenViewCamera";

require("../index.css");

export default function CameraViewItem({
  camera,
  numberInRow,
}: {
  camera: Camera | null;
  numberInRow: number;
}) {
  // @ts-ignore
  const [authController] = useAuthenController();

  const [pause, setPause] = useState(true);

  // @ts-ignore
  useEffect(async () => {
    const listCamera = localStorage.getItem(
      CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module")
    );
    if (listCamera !== null && camera) {
      const listCameraArray = JSON.parse(listCamera);

      if (listCameraArray.filter((item: number) => item === camera.id).length > 0) {
        setPause(false);
      } else {
        setPause(true);
      }
    } else {
      setPause(true);
    }
  }, [camera, localStorage.getItem(CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module"))]);

  const handlePlay = async (e: any) => {
    e.stopPropagation();
    setPause(false);
    // Start camera
    if (authController.currentUser !== null && camera !== null) {
      const listCamera = localStorage.getItem(
        CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module")
      );
      let listCameraArray = listCamera !== null ? JSON.parse(listCamera) : [];
      listCameraArray = listCameraArray.filter((item: number) => item !== camera.id);
      listCameraArray.push(camera.id);
      localStorage.setItem(
        CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module"),
        JSON.stringify(listCameraArray)
      );
    }
  };

  const handlePause = () => {
    setPause(true);
    if (camera) {
      const listCamera = localStorage.getItem(
        CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module")
      );
      if (listCamera !== null) {
        let listCameraArray = JSON.parse(listCamera);
        listCameraArray = listCameraArray.filter((item: number) => item !== camera.id);
        localStorage.setItem(
          CAMERA_STARTED_LOCAL_STORAGE + localStorage.getItem("module"),
          JSON.stringify(listCameraArray)
        );
      }
    }
  };
  const canvasRef = useRef();
  const [defaultPolygons, setDefaultPolygons] = useState<string | undefined>(undefined);

  // scale polygons
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (camera)
      if (camera.polygons && camera.polygons.trim() !== "") {
        setDefaultPolygons(camera.polygons);
      } else {
        setDefaultPolygons("[]");
      }
  }, [camera]);

  return camera !== null ? (
    <Grid
      key={`${camera.name}_${camera.id}`}
      item
      xs={12 / numberInRow}
      md={12 / numberInRow}
      lg={12 / numberInRow}
      style={{ position: "relative" }}
    >
      {defaultPolygons !== undefined && (
        <OpenViewCamera
          handlePlay={handlePlay}
          handlePause={handlePause}
          pause={pause}
          cameraName={`${camera?.location?.name} > ${camera?.name}`}
          camId={camera.id}
          areaRestriction={camera.areaRestriction?.areaName}
          canvasRef={canvasRef}
          defaultPolygons={defaultPolygons}
          canEdit={false}
        />
      )}
    </Grid>
  ) : (
    <div />
  );
}
