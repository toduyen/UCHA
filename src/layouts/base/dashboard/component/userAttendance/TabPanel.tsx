import { AppBar, Box, Tab, Tabs } from "@mui/material";
import PropTypes from "prop-types";
import HomeIcon from "@mui/icons-material/Home";
import PsychologyTwoToneIcon from "@mui/icons-material/PsychologyTwoTone";
import GroupTwoToneIcon from "@mui/icons-material/GroupTwoTone";
import React, { useState } from "react";

export function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`a11y-tabpanel-${index}`}
      aria-labelledby={`a11y-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={2}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function defaultStatusViewport() {
  return window.innerWidth >= 1350;
}

export function TitleTabs(props: any) {
  const { labelId, onChange, selectionFollowsFocus, value } = props;
  const [isViewportWidth, setIsViewportWidth] = useState(() => defaultStatusViewport());
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1350 && !isViewportWidth) {
      setIsViewportWidth(true);
    } else if (window.innerWidth < 1350 && isViewportWidth) {
      setIsViewportWidth(false);
    }
  });

  return (
    <AppBar position="static">
      <Tabs
        aria-labelledby={labelId}
        onChange={onChange}
        selectionFollowsFocus={selectionFollowsFocus}
        value={value}
      >
        <Tab
          label={isViewportWidth ? "Tất cả" : ""}
          aria-controls="a11y-tabpanel-0"
          id="a11y-tab-0"
          icon={<HomeIcon />}
        />
        <Tab
          label={isViewportWidth ? "Người lạ" : ""}
          aria-controls="a11y-tabpanel-1"
          id="a11y-tab-1"
          icon={<PsychologyTwoToneIcon />}
          data-tut="reactour__nine_one"
        />
        <Tab
          label={isViewportWidth ? "Nhân viên" : ""}
          aria-controls="a11y-tabpanel-2"
          id="a11y-tab-2"
          icon={<GroupTwoToneIcon />}
          data-tut="reactour__nine_two"
        />
      </Tabs>
    </AppBar>
  );
}

TitleTabs.propTypes = {
  labelId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  selectionFollowsFocus: PropTypes.bool,
  value: PropTypes.number.isRequired,
};
