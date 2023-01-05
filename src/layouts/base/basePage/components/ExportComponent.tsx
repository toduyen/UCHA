import MDBox from "../../../../components/bases/MDBox";
import MDButton from "../../../../components/bases/MDButton";
import Icon from "@mui/material/Icon";
import React from "react";

export default function ExportComponent({
  title,
  linkDownload,
}: {
  title: string;
  linkDownload: string;
}) {
  return (
    <MDBox mr={1}>
      <a href={linkDownload} target="_blank" rel="noopener noreferrer" download>
        <MDButton variant="text" color="white">
          <MDBox display="flex" alignSelf="center" color="white">
            <Icon>file_download</Icon>&nbsp;{title}
          </MDBox>
        </MDButton>
      </a>
    </MDBox>
  );
}
