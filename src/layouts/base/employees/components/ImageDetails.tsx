import { Employee } from "models/base/employee";
import React from "react";
// @ts-ignore
import GalleryImage from "../../../../components/customizes/GalleryImage";

export default function ImageDetails({
  handleClose,
  employee,
  dataEmployees,
}: {
  handleClose: any;
  employee: Employee;
  dataEmployees: Employee[];
}) {
  return <GalleryImage employees={dataEmployees} employee={employee} handleClose={handleClose} />;
}
