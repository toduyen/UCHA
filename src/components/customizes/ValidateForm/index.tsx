import React from "react";
import {
  detectWhiteSpaceAll,
  detectWhiteSpaceBeetween,
  detectWhiteSpaceEnd,
  detectWhiteSpaceStart,
  validUserRegex,
} from "./RegExCode";

export default function validateAutoComplete(value: string) {
  // eslint-disable-next-line no-shadow
  const removeExtraSpace = (value: string) => value?.replace(detectWhiteSpaceStart, "");
  const preventStartAndEnd = removeExtraSpace(value).replace(detectWhiteSpaceEnd, "");
  return preventStartAndEnd.replace(detectWhiteSpaceBeetween, " ");
}
export const validateTextField = (value: any) =>
  typeof value === "string" ? value.replace(detectWhiteSpaceAll, "") : value;

export const isValidUser = (user: string) => !(user === null || !user.match(validUserRegex));
