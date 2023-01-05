import React from "react";
import MDTypography from "../../../bases/MDTypography";
import MDBox from "../../../bases/MDBox";

// eslint-disable-next-line no-undef
function FormatContent({ contentMessage }: { contentMessage: string }) {
  // @ts-ignore
  return (
    <MDBox>
      <MDTypography
        color="dark"
        style={{
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
          color: "black",
        }}
        variant="h6"
      >
        {contentMessage}
      </MDTypography>
    </MDBox>
  );
}

export default FormatContent;
