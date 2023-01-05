// react-router components
// prop-types is a library for typechecking of props

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/bases/MDBox";
import ImageCard from "./ImageCard";
import React from "react";

function SimpleBlogCard({
  image,
  image2,
  title,
  description,
  handleClick,
  customeStyle,
  imageWidth,
  children,
}: {
  image: string;
  image2?: string;
  title: any;
  description: any;
  handleClick?: any;
  customeStyle?: any;
  imageWidth?: number;
  children?: React.ReactElement;
}) {
  return (
    <Card onClick={handleClick} style={customeStyle}>
      <MDBox display="flex" justifyContent="center">
        <ImageCard image={image} width={image2 ? 90 : imageWidth || 40} />
        {image2 && <ImageCard image={image2} width={90} />}
      </MDBox>
      <MDBox px={3} py={1.5}>
        <MDBox display="inline" textTransform="capitalize" fontWeight="bold">
          {title}
        </MDBox>
        <MDBox mt={0.5}>
          <MDBox color="text">{description}</MDBox>
        </MDBox>
        {children}
      </MDBox>
    </Card>
  );
}

export default SimpleBlogCard;
