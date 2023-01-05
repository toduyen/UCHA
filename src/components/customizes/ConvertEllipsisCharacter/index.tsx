import React, { ComponentProps, FC } from "react";
import { Tooltip } from "@mui/material";
import MDBox from "../../bases/MDBox";

export default function convertEllipsisCharacter(str: string, maxLength: number) {
  const renderTooltip = () => {
    if (str?.length > maxLength) {
      return (
        <Tooltip title={str}>
          <MDBox style={{ color: "inherit", fontSize: "inherit", fontStyle: "inherit" }}>
            {str?.length > maxLength ? `${str?.substring(0, maxLength)}...` : str}
          </MDBox>
        </Tooltip>
      );
    }
    return str;
  };
  return renderTooltip();
}
