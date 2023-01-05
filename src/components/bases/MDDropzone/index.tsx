import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import MDBox from "../MDBox";
import { showSnackbar, useSnackbarController } from "../../../context/snackbarContext";
import { ERROR_TYPE } from "../../../constants/app";

function MDDropzone({
  children,
  handleOnAbort,
  handleOnError,
  handleOnLoad,
}: {
  children: React.ReactElement;
  handleOnAbort: Function;
  handleOnError: Function;
  handleOnLoad: (file: any, fileData: any) => void;
}) {
  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => handleOnAbort();
      reader.onerror = () => handleOnError();
      reader.onload = () => {
        const binaryStr = reader.result;
        handleOnLoad(file, binaryStr);
      };
      reader.readAsDataURL(file);
    });
  }, []);
  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/jpeg": [".jpeg", ".jpg", ".png"],
    },
    // maxSize: 1048576, <------- in bytes
  });
  useEffect(() => {
    if (fileRejections[0]?.errors[0]?.code === "file-invalid-type") {
      showSnackbar(snackbarDispatch, {
        typeSnackbar: ERROR_TYPE,
        messageSnackbar: "Nhập file không đúng định dạng",
      });
    }
  }, [fileRejections]);

  return (
    <MDBox {...getRootProps()} width="fit-content">
      <input {...getInputProps()} />
      {children}
    </MDBox>
  );
}

export default MDDropzone;
