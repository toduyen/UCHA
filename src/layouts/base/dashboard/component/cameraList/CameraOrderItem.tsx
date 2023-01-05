import { Checkbox, Grid } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import { Camera } from "models/base/camera";
import React, { useEffect, useState } from "react";
import convertEllipsisCharacter from "../../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH } from "../../../../../constants/app";

export default function CameraOrderItems({
  camera,
  index,
  orderIndex,
  isDisableCheckbox,
  handleUpdateIndex,
  provided,
  snapshot,
}: {
  camera: Camera;
  index: number;
  orderIndex: number;
  isDisableCheckbox: boolean;
  handleUpdateIndex: (newIndex: number, newOrderIndex: number) => void;
  provided: any;
  snapshot: any;
}) {
  const [orderIndexState, setOrderIndexState] = useState<number>(orderIndex);
  const [disabledCheckbox, setDisabledCheckbox] = useState<boolean>(
    isDisableCheckbox && orderIndexState === 0
  );

  useEffect(() => {
    setOrderIndexState(orderIndex);
  }, [orderIndex]);

  useEffect(() => {
    setDisabledCheckbox(isDisableCheckbox && orderIndexState === 0);
  }, [isDisableCheckbox]);

  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOrderIndexState = event.target.checked ? 1 : 0;
    setOrderIndexState(newOrderIndexState);
    handleUpdateIndex(index, newOrderIndexState);
  };

  return (
    <MDBox
      ref={provided?.innerRef}
      snapshot={snapshot}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      <MDBox
        className="borderItem_Box--HightLight"
        display="flex"
        mb={2}
        md={2}
        lg={2}
        style={{ alignItems: "center" }}
      >
        <Grid item xs={4} md={4} lg={4}>
          <Checkbox
            checked={orderIndexState > 0}
            onChange={(event) => handleCheckbox(event)}
            disabled={disabledCheckbox}
          />
        </Grid>
        <Grid item xs={8} md={8} lg={8}>
          <MDTypography style={{ fontSize: "18px" }}>
            {convertEllipsisCharacter(camera?.name, STRING_SHORT_LENGTH)}
          </MDTypography>
        </Grid>
      </MDBox>
    </MDBox>
  );
}
