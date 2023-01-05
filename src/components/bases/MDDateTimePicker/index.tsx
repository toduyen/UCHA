import * as React from "react";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

function MDDateTimePicker({
  label,
  datetime,
  handleChooseDateTime,
  error,
}: {
  label: string;
  datetime: Date | null;
  handleChooseDateTime: (value: Date | null) => void;
  error?: string;
}) {
  const [value, setValue] = React.useState<Date | null>(datetime);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        ampm={false}
        inputFormat="dd/MM/yyyy HH:mm:ss"
        mask="__/__/____ __:__:__"
        label={label}
        renderInput={(params) => <TextField {...params} error={!!error} helperText={error} />}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          handleChooseDateTime(newValue);
        }}
        maxDate={new Date()}
      />
    </LocalizationProvider>
  );
}

export default MDDateTimePicker;
