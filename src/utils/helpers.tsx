import {
  ACTIVE_TYPE,
  DELETED_TYPE,
  MAX_LENGTH_NUMBER,
  MAX_LENGTH_STRING,
  MAX_LENGTH_STRING_FOR_DESCRIPTION,
  MODULE_AREA_RESTRICTION_TYPE,
  MODULE_BEHAVIOR_TYPE,
  MODULE_TIME_KEEPING_TYPE,
  PENDING_TYPE,
} from "constants/app";
import { User } from "models/base/user";
import { isAreaRestrictionAdmin, isBehaviorAdmin, isTimeKeepingAdmin } from "./checkRoles";
import MDTypography from "../components/bases/MDTypography";
import { detectSpecialCharacterInCodeFields } from "../components/customizes/ValidateForm/RegExCode";

const isValidPassword = (password: string | null) =>
  !(
    password === null ||
    !password.match(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+\ ]).{8,}$/)
  );

const isValidUsername = (username: string | null) =>
  !(username === null || !username.match(/^[a-zA-Z0-9]{5,}$/));

const isValidLocationCode = (location: string | null) =>
  !(location === null || !location.match(detectSpecialCharacterInCodeFields));

const isValidEmployeeCode = (employeeCode: string | null) =>
  !(employeeCode === null || !employeeCode.match(detectSpecialCharacterInCodeFields));
const isValidAreaRestrictionCode = (code: string | null) =>
  !(code === null || !code.match(detectSpecialCharacterInCodeFields));

const isValidEmail = (email: string | null) =>
  !(
    email === null ||
    !email.trim().match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
  );

// time only integers
const isValidTimeNotification = (time: string | null) =>
  !(time === null || !String(time).match(/^[0-9]+$/));

const detectSpaceAtEnd = (value: string) => {
  if (value.slice(-1) === " ") {
    return true;
  }
  return false;
};

const toolDeleteOneCharLast = (value: string) => value.slice(0, -1);

// max length of string is 255
const checkMaxLengthOfString = (value: string) => !(value?.length > MAX_LENGTH_STRING);
const checkMaxLengthOfDescription = (value: string) =>
  !(value?.length > MAX_LENGTH_STRING_FOR_DESCRIPTION);
// max length if number is 2 ^ 31 - 1
const checkMaxLengthNumber = (value: string) => !(Number(value) > MAX_LENGTH_NUMBER);
const isNegative = (value: any) => !(Math.sign(value) === -1);
const convertTimeStringToDate = (time: string) => {
  const now = new Date();
  const [hour, minute, second] = time.split(":");
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    parseInt(hour, 10),
    parseInt(minute, 10),
    parseInt(second, 10)
  );
};

const convertTimeFromDateTime = (time: Date) => {
  const hour = `0${time.getHours()}`.slice(-2);
  const minute = `0${time.getMinutes()}`.slice(-2);
  const second = `0${time.getSeconds()}`.slice(-2);
  return `${hour}:${minute}:${second}`;
};

const convertStringFromDateTime = (time: Date) => {
  const date = `0${time.getDate()}`.slice(-2);
  const month = `0${time.getMonth() + 1}`.slice(-2);
  const year = time.getFullYear();
  return `${date}/${month}/${year} ${convertTimeFromDateTime(time)}.${time.getMilliseconds()}`;
};
const isValidPhone = (phone: string | null) =>
  !(phone === null || !phone.trim().match(/^[0-9]{10,15}$/));

const convertStringTime = (time: string) => {
  const datetime = new Date(time);
  const date = `0${datetime.getDate()}`.slice(-2);
  const month = `0${datetime.getMonth() + 1}`.slice(-2);
  const year = datetime.getFullYear();
  return `${date}/${month}/${year} ${convertTimeFromDateTime(datetime)}`;
};

const getStartCurrentDateString = () => {
  const datetime = new Date();
  const date = `0${datetime.getDate()}`.slice(-2);
  const month = `0${datetime.getMonth() + 1}`.slice(-2);
  const year = datetime.getFullYear();
  return `${date}/${month}/${year} 00:00:00`;
};

const getEndCurrentDateString = () => {
  const datetime = new Date();
  const date = `0${datetime.getDate()}`.slice(-2);
  const month = `0${datetime.getMonth() + 1}`.slice(-2);
  const year = datetime.getFullYear();
  return `${date}/${month}/${year} 23:59:59`;
};

const convertStringToDate = (datetimeString: string) => {
  const [dateString, timeString] = datetimeString.split(" ");
  const [date, month, year] = dateString.split("/");
  const [hour, minute, second] = timeString.split(":");
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(date, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
    parseInt(second, 10)
  );
};

const convertStatusToString = (status: string) => {
  switch (status) {
    case "active":
      return (
        <MDTypography variant="body2" color="success">
          {ACTIVE_TYPE}
        </MDTypography>
      );
    case "deleted":
      return (
        <MDTypography variant="body2" color="error">
          {DELETED_TYPE}
        </MDTypography>
      );
    case "pending":
      return <MDTypography variant="body2">{PENDING_TYPE}</MDTypography>;
    default:
      return null;
  }
};

const getModuleOfUser = (user: User) => {
  if (isTimeKeepingAdmin(user)) {
    return MODULE_TIME_KEEPING_TYPE;
  }

  if (isAreaRestrictionAdmin(user)) {
    return MODULE_AREA_RESTRICTION_TYPE;
  }

  if (isBehaviorAdmin(user)) {
    return MODULE_BEHAVIOR_TYPE;
  }
  return "";
};

const getOurId = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 || 0;
    const v = c === "x" ? r : (r && 0x3) || 0x8;
    return v.toString(16);
  });

// get name image
const getNameImageInUrl = (name: string) =>
  // @ts-ignore
  name.split("/")?.pop()?.split(".")[0];

export {
  isValidPassword,
  isValidUsername,
  isValidEmail,
  isValidPhone,
  isValidLocationCode,
  convertTimeStringToDate,
  convertTimeFromDateTime,
  convertStringFromDateTime,
  convertStringTime,
  getEndCurrentDateString,
  getStartCurrentDateString,
  convertStringToDate,
  convertStatusToString,
  getModuleOfUser,
  getOurId,
  getNameImageInUrl,
  detectSpaceAtEnd,
  toolDeleteOneCharLast,
  isValidEmployeeCode,
  isValidAreaRestrictionCode,
  checkMaxLengthOfString,
  checkMaxLengthNumber,
  isValidTimeNotification,
  checkMaxLengthOfDescription,
  isNegative,
};
