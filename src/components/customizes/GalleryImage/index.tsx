import React, { useEffect, useState } from "react";
// Material Dashboard 2 React components
import MDBox from "components/bases/MDBox";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import "./style/index.css";
import { Employee } from "../../../models/base/employee";
import convertEllipsisCharacter from "../ConvertEllipsisCharacter";
import { STRING_LONG_LENGTH } from "../../../constants/app";

function GalleryImage({
  // all data
  employees,
  // current employee
  employee,
  // close modal
  handleClose,
}: {
  employees: Employee[];
  employee: Employee;
  handleClose: () => void;
}) {
  // state Show hide GalleryImage
  const [employeesState, setEmployeesState] = useState<Employee[]>([]);
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // get all dataEmployees
  /*
            Reason: Because when merge personnel, it will generate child arrays inside the parent array [dataEmployees]
            meaningful function: Get all child [Employees] arrays inside parent array [dataEmployees]
        */
  useEffect(() => {
    const data: any = [];
    // eslint-disable-next-line array-callback-return
    employees?.map((item: Employee) => {
      if (item?.employees?.length > 0) {
        const dataChildrenEmployees: Employee = item;
        // eslint-disable-next-line array-callback-return
        dataChildrenEmployees?.employees?.map((itemChildren: Employee) => {
          data.push({
            // @ts-ignore
            image: itemChildren?.image?.props?.children?.props?.image,
            name: itemChildren?.name,
            id: itemChildren?.id,
          });
        });
      } else {
        data.push({ image: item?.image?.path, name: item?.name, id: item?.id });
      }
    });
    setEmployeesState(data);
  }, [employees]);
  // set Index for next and prev exactly
  useEffect(() => {
    // eslint-disable-next-line array-callback-return
    employeesState?.map((item: Employee, index: number) => {
      if (item?.id === employee?.id) {
        setPhotoIndex(index);
      }
    });
  }, [employeesState]);

  // CODE HERE
  return (
    <MDBox>
      {isOpen && (
        // @ts-ignore
        <Lightbox
          reactModalStyle={{ overlay: { zIndex: 9999 } }}
          mainSrc={employeesState[photoIndex]?.image}
          imageCaption={employeesState[photoIndex]?.name}
          // eslint-disable-next-line no-unsafe-optional-chaining
          nextSrc={
            // eslint-disable-next-line no-unsafe-optional-chaining
            employeesState?.length - 1 === photoIndex
              ? undefined
              : // eslint-disable-next-line no-unsafe-optional-chaining
                employeesState[(photoIndex + 1) % employeesState?.length]?.image
          }
          prevSrc={
            // eslint-disable-next-line no-unsafe-optional-chaining
            photoIndex === 0
              ? undefined
              : // eslint-disable-next-line no-unsafe-optional-chaining
                employeesState[(photoIndex + employeesState?.length - 1) % employeesState?.length]
                  ?.image
          }
          onCloseRequest={() => {
            setIsOpen((prevState) => !prevState);
            handleClose();
          }}
          onMovePrevRequest={() =>
            // eslint-disable-next-line no-unsafe-optional-chaining
            setPhotoIndex(
              // eslint-disable-next-line no-unsafe-optional-chaining
              (prevState) => (prevState + employeesState?.length - 1) % employeesState?.length
            )
          }
          onMoveNextRequest={() =>
            // eslint-disable-next-line no-unsafe-optional-chaining
            setPhotoIndex((prevState) => (prevState + 1) % employeesState?.length)
          }
        />
      )}
    </MDBox>
  );
}

export default React.memo(GalleryImage);
