import * as React from "react";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

function MDTimePicker({
  label,
  time,
  handleChooseTime,
  error,
}: {
  label: string;
  time: Date | null;
  handleChooseTime: (value: Date | null) => void;
  error?: string;
}) {
  const [value, setValue] = React.useState<Date | null>(time);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        ampm={false}
        inputFormat="HH:mm:ss"
        mask="__:__:__"
        label={label}
        renderInput={(params) => (
          <TextField {...params} error={!!error} helperText={error ? error : ""} />
        )}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          handleChooseTime(newValue);
        }}
      />
    </LocalizationProvider>
  );
}

export default MDTimePicker;
