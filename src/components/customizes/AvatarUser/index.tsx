import { Metadata } from "../../../models/base/metadata";
import { useState } from "react";
import MDBox from "../../bases/MDBox";
import MDDropzone from "../../bases/MDDropzone";
import MDAvatar from "../../bases/MDAvatar";
import { Icon } from "@mui/material";
// @ts-ignore
import avatarDefault from "assets/images/avatar_default.png";

export default function AvatarUser({
  avatar,
  handleFile,
  error,
}: {
  avatar: Metadata | null | File;
  handleFile: (file: any) => void;
  error?: string;
}) {
  const [fileData, setFileData] = useState(null);
  const handleChangeFile = (file: any, data: any) => {
    handleFile(file);
    setFileData(data);
  };
  const getBase64 = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // @ts-ignore
      setFileData(reader.result);
    };
    // eslint-disable-next-line no-shadow
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };
  };

  return (
    <>
      <MDBox display="flex" justifyContent="center" paddingBottom="41px">
        <MDDropzone
          handleOnAbort={() => {}}
          handleOnError={() => {}}
          handleOnLoad={handleChangeFile}
        >
          <MDBox position="relative">
            <MDAvatar
              src={
                fileData == null
                  ? avatar !== null
                    ? // @ts-ignore
                      avatar.name !== undefined
                      ? // @ts-ignore
                        getBase64(avatar)
                      : // @ts-ignore
                        avatar.path
                    : avatarDefault
                  : fileData
              }
              alt=""
              size="xxl"
              shadow="md"
            />
            <Icon
              style={{
                color: "white",
                position: "absolute",
                top: "40%",
                left: "40%",
              }}
            >
              image
            </Icon>
          </MDBox>
        </MDDropzone>
      </MDBox>
      <MDBox
        style={{ fontSize: "13px", color: "#F44335", display: "flex", justifyContent: "center" }}
      >
        {error}
      </MDBox>
    </>
  );
}
