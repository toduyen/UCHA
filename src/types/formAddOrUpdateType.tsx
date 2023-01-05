import React from "react";

export type FieldType = {
  data: any;
  checked?: any;
  choosedValue?: string | null;
  type: string;
  label: string;
  action: Function;
  actionBlur?: Function;
  error?: string;
  disabled?: boolean;
};

export type FormAddOrUpdateType = {
  title: string;
  fields: Array<FieldType>;
  handleAddOrUpdate: Function;
  actionLabel: string;
  visibleCloseButton?: boolean;
  handleClose?: Function;
  headChildren?: React.ReactElement;
  children?: React.ReactElement;
  showConfirmClose?: boolean;
  isShow?: boolean;
};
