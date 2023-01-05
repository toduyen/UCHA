import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import { Shift } from "models/time-keeping/shift";
import MDTypography from "components/bases/MDTypography";
import MDBox from "components/bases/MDBox";
import MDTimePicker from "components/bases/MDTimePicker";
import { convertTimeFromDateTime, convertTimeStringToDate } from "utils/helpers";
import { updateShiftIsValid, useShiftController } from "../../../../context/shiftContext";
import { TIME_IS_NOT_VALID, TIME_IS_REQUIRE } from "../../../../constants/validate";

export default function ShiftItem({
  shift,
  handleChange,
}: {
  shift: Shift;
  handleChange: (newShift: Shift) => void;
}) {
  const [errorTimeStart, setErrorTimeStart] = useState("");
  const [errorEndTime, setErrorEndTime] = useState("");
  // @ts-ignore
  const [, shiftDispatch] = useShiftController();

  const handleChangeStartTime = (time: Date | null) => {
    if (time === null) {
      setErrorTimeStart(TIME_IS_REQUIRE);
      updateShiftIsValid(shiftDispatch, false);
      return;
    }
    if (time.toLocaleString() === "Invalid Date") {
      setErrorTimeStart(TIME_IS_NOT_VALID);
      updateShiftIsValid(shiftDispatch, false);
      return;
    }
    handleChange({
      ...shift,
      timeStart: convertTimeFromDateTime(time),
    });
    if (!errorEndTime) updateShiftIsValid(shiftDispatch, true);
    setErrorTimeStart("");
  };

  const handleChangeEndTime = (time: Date | null) => {
    if (time === null) {
      setErrorEndTime(TIME_IS_REQUIRE);
      updateShiftIsValid(shiftDispatch, false);
      return;
    }
    if (time.toLocaleString() === "Invalid Date") {
      setErrorEndTime(TIME_IS_NOT_VALID);
      updateShiftIsValid(shiftDispatch, false);
      return;
    }
    handleChange({
      ...shift,
      timeEnd: convertTimeFromDateTime(time),
    });
    if (!errorTimeStart) updateShiftIsValid(shiftDispatch, true);
    setErrorEndTime("");
  };
  return (
    <Grid container mb={3} spacing={4}>
      <Grid item xs={3} md={3} lg={3}>
        <MDTypography fontSize={16} fontWeight="medium">
          {shift.name}
        </MDTypography>
      </Grid>
      <Grid item xs={9} md={9} lg={9}>
        <MDBox display="flex" flexDirection="row" justifyContent="space-between" gap={2}>
          <MDTimePicker
            label="Thời gian bắt đầu"
            time={convertTimeStringToDate(shift.timeStart)}
            handleChooseTime={(time) => handleChangeStartTime(time)}
            error={errorTimeStart}
          />
          <MDTimePicker
            label="Thời gian kết thúc"
            time={convertTimeStringToDate(shift.timeEnd)}
            handleChooseTime={(time) => handleChangeEndTime(time)}
            error={errorEndTime}
          />
        </MDBox>
      </Grid>
    </Grid>
  );
}
