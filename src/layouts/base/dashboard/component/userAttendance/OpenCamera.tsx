import { Grid, Icon, IconButton } from "@mui/material";
import { useRef, useState } from "react";
// @ts-ignore
import OpenViewCamera from "layouts/base/camera/components/OpenViewCamera";
import MDBox from "components/bases/MDBox";

function OpenCamera({
  handleClose,
  cameraId,
  cameraTaken,
  cameraName,
  polygons,
}: {
  handleClose: any;
  cameraId: number;
  cameraTaken: string;
  cameraName: string;
  polygons: string | undefined;
}) {
  const [pause, setPause] = useState(false);

  const handlePause = (e: any) => {
    e.stopPropagation();
    setPause(true);
  };

  const handlePlay = (e: any) => {
    e.stopPropagation();
    setPause(false);
  };
  const ref = useRef(null);

  return (
    <MDBox px={1} width="100%" height="100vh" mx="auto">
      <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
        <Grid item xs={11} sm={9} md={7} lg={7} xl={7} position="relative">
          <OpenViewCamera
            handlePlay={handlePlay}
            handlePause={handlePause}
            pause={pause}
            cameraName={cameraName}
            handleClose={handleClose}
            camId={cameraId}
            canvasRef={ref}
            defaultPolygons={polygons}
            canEdit={false}
          >
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={(e: any) => {
                e.stopPropagation();
                handleClose();
              }}
              style={{
                position: "absolute",
                right: 10,
                top: 15,
                zIndex: 1,
              }}
            >
              <Icon fontSize="large" style={{ color: "white" }}>
                close
              </Icon>
            </IconButton>
          </OpenViewCamera>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default OpenCamera;
