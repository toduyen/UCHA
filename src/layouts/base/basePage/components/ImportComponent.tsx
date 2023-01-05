import MDButton from "../../../../components/bases/MDButton";
import Icon from "@mui/material/Icon";
import MDBox from "../../../../components/bases/MDBox";
import React from "react";
import { Tooltip } from "@mui/material";

export default function ImportComponent({
  title,
  handleImport,
}: {
  title: string;
  handleImport: (files: any) => void;
}) {
  function TooltipTitle() {
    return (
      <MDBox style={{ color: "white" }}>
        <p>Tải lên thư mục gồm:</p>
        <p>- 1 file excel danh sách nhân sự (theo mẫu).</p>
        <p>- Các file ảnh nhân viên (đặt tên file ảnh là mã nhân viên)</p>
      </MDBox>
    );
  }

  return (
    <MDBox mr={1} display="flex" alignItems="center">
      <Tooltip title={<TooltipTitle />}>
        <MDButton variant="text" color="white">
          <label htmlFor="import-image" style={{ cursor: "pointer" }}>
            <input
              style={{ display: "none" }}
              type="file"
              id="import-image"
              // @ts-ignore
              webkitdirectory=""
              mozdirectory=""
              directory=""
              onChange={(e) => {
                handleImport(e.target.files);
                e.target.value = "";
              }}
            />

            <MDBox display="flex" alignSelf="center" color="white">
              <Icon>upload_file</Icon>&nbsp;{title}
            </MDBox>
          </label>
        </MDButton>
      </Tooltip>
    </MDBox>
  );
}
