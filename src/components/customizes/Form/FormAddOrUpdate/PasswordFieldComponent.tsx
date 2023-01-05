import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import React from "react";

function PasswordFieldComponent({ field }: { field: any }) {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormControl sx={{ m: 1, width: "100%", margin: "8px 0" }} variant="outlined">
      <InputLabel htmlFor={field.label}>{field.label}</InputLabel>
      <OutlinedInput
        fullWidth={true}
        id={field.label}
        type={showPassword ? "text" : "password"}
        onChange={(e: any) => field.action(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={field.label}
        error={!!field.error}
      />
      {!!field.error && <FormHelperText error>{field.error}</FormHelperText>}
    </FormControl>
  );
}

export default PasswordFieldComponent;
