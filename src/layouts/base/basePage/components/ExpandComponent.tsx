import MDBox from "../../../../components/bases/MDBox";
import MDButton from "../../../../components/bases/MDButton";
import Icon from "@mui/material/Icon";
import React from "react";
import { Modal, Tooltip } from "@mui/material";
import InOutHistoryBoard from "../../inOutHistory/components/InOutHistoryBoard";

export default function ExpandComponent({
  handleOnClick,
  tooltipContent,
  statusOpenModal,
  titleModal,
}: {
  handleOnClick: Function;
  tooltipContent: string;
  statusOpenModal: boolean;
  titleModal: string;
}) {
  return (
    <MDBox mr={1}>
      <Tooltip title={tooltipContent}>
        <MDButton
          variant="text"
          color="white"
          onClick={handleOnClick}
          data-inout-history="InOutHistory__step2"
        >
          <Icon>zoom_out_map</Icon>&nbsp;
        </MDButton>
      </Tooltip>
      <Modal
        open={statusOpenModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {InOutHistoryBoard(handleOnClick, statusOpenModal, titleModal)}
      </Modal>
    </MDBox>
  );
}
