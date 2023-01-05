// react-router-dom components
// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import React from "react";
import { MAIN_ROUTE } from "../../../constants/route";
import { useNavigate } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

function Breadcrumbs({
  icon,
  title,
  route,
  module,
  light = false,
}: {
  icon: React.ReactNode;
  title: string;
  route: string | Array<string>;
  module: string | null;
  light: boolean;
}) {
  const navigate = useNavigate();
  return (
    <MDBox mr={{ xs: 0, xl: 8 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="medium" />}
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }: any) => (light ? white.main : grey[600]),
            margin: "-4px",
          },
        }}
      >
        <MDBox
          sx={{ cursor: "pointer" }}
          onClick={() => {
            localStorage.removeItem("module");
            navigate(MAIN_ROUTE);
          }}
        >
          <MDTypography
            component="span"
            variant="h6"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            fontSize={28}
            sx={{ lineHeight: 0 }}
          >
            <Icon>{icon}</Icon>
          </MDTypography>
        </MDBox>

        {module && (
          <MDTypography
            variant="h6"
            fontWeight="regular"
            // textTransform="capitalize"
            color={light ? "white" : "dark"}
            sx={{ lineHeight: 0 }}
          >
            {module}
          </MDTypography>
        )}

        <MDTypography
          variant="h6"
          fontWeight="regular"
          // textTransform="capitalize"
          color={light ? "white" : "dark"}
          sx={{ lineHeight: 0 }}
        >
          {title.replace("-", " ")}
        </MDTypography>
      </MuiBreadcrumbs>
    </MDBox>
  );
}

// Setting default values for the props of Breadcrumbs
Breadcrumbs.defaultProps = {
  light: false,
};

// Typechecking props for the Breadcrumbs
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool,
};

export default Breadcrumbs;
