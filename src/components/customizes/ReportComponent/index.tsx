import { Autocomplete, Card, Checkbox, Grid, Icon, TextField } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDButton from "components/bases/MDButton";
import MDTypography from "components/bases/MDTypography";
import React, { useEffect, useState } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import MDDateTimePicker from "components/bases/MDDateTimePicker";
import {
  convertStringFromDateTime,
  convertStringToDate,
  getEndCurrentDateString,
  getStartCurrentDateString,
} from "utils/helpers";
import { ReportType } from "../../../types/reportType";
import MDInput from "../../bases/MDInput";
import {
  TIME_END_SMALLER_TIME_START,
  TIME_IS_BIGGER_THAN_TIME_CURRENT,
  TIME_IS_NOT_VALID,
  TIME_IS_REQUIRE,
  TIME_START_BIGGER_TIME_END,
} from "../../../constants/validate";
import convertEllipsisCharacter from "../ConvertEllipsisCharacter";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function ReportComponent({
  title,
  fields,
  baseReportLink,
  actionReport,
  children,
}: ReportType) {
  const [reportLink, setReportLink] = useState("");
  const [timeStart, setTimeStart] = useState<string>(getStartCurrentDateString());
  const [timeEnd, setTimeEnd] = useState<string>(getEndCurrentDateString());
  const [timeStartError, setTimeStartError] = useState<string>("");
  const [timeEndError, setTimeEndError] = useState<string>("");

  // validate form filter
  const [valueInputMultiple, setValueInputMultiple] = React.useState<string>("");
  const [valueInput, setValueInput] = React.useState<string>("");

  // @ts-ignore
  useEffect(() => {
    let newReportLink = baseReportLink;
    if (timeStart && timeStart !== "") {
      newReportLink += `&time_start=${timeStart}`;
    }
    if (timeEnd && timeEnd !== "") {
      newReportLink += `&time_end=${timeEnd}`;
    }
    setReportLink(newReportLink);
  }, [timeEnd, timeStart, baseReportLink]);

  const handleChangeTimeStart = (time: Date | null) => {
    const timeStartFeature = new Date();
    setTimeStartError("");
    if (time === null) {
      setTimeStartError(TIME_IS_REQUIRE);
      return;
    }
    // is not valid
    if (time == null || time.toLocaleString() === "Invalid Date") {
      setTimeStartError(TIME_IS_NOT_VALID);
      return;
    }
    if (time.getTime() > timeStartFeature.getTime()) {
      // eslint-disable-next-line consistent-return
      return setTimeStartError(TIME_IS_BIGGER_THAN_TIME_CURRENT);
    }
    setTimeStart(convertStringFromDateTime(time));
    if (
      timeEndError !== TIME_IS_NOT_VALID &&
      timeEndError !== TIME_IS_REQUIRE &&
      timeEndError !== TIME_IS_BIGGER_THAN_TIME_CURRENT &&
      !isTimeStartSmallerTimeEnd(convertStringFromDateTime(time), timeEnd)
    ) {
      setTimeStartError(TIME_START_BIGGER_TIME_END);
    }
  };

  const handleChangeTimeEnd = (time: Date | null) => {
    const timeEndFeature = getEndCurrentDateString();
    setTimeEndError("");
    if (time === null) {
      setTimeEndError(TIME_IS_REQUIRE);
      return;
    }
    // is not valid
    if (time == null || time.toLocaleString() === "Invalid Date") {
      setTimeEndError(TIME_IS_NOT_VALID);
      return;
    }
    if (time.getTime() > convertStringToDate(timeEndFeature).getTime()) {
      // eslint-disable-next-line consistent-return
      return setTimeEndError(TIME_IS_BIGGER_THAN_TIME_CURRENT);
    }
    setTimeEnd(convertStringFromDateTime(time));

    if (
      timeStartError !== TIME_IS_NOT_VALID &&
      timeStartError !== TIME_IS_REQUIRE &&
      timeStartError !== TIME_IS_BIGGER_THAN_TIME_CURRENT &&
      !isTimeStartSmallerTimeEnd(timeStart, convertStringFromDateTime(time))
    ) {
      setTimeEndError(TIME_END_SMALLER_TIME_START);
    }
  };

  useEffect(() => {
    if (isTimeStartSmallerTimeEnd(timeStart, timeEnd)) {
      setTimeStartError(() => {
        if (timeStartError === TIME_IS_NOT_VALID) {
          return TIME_IS_NOT_VALID;
        }
        if (timeStartError === TIME_IS_REQUIRE) {
          return TIME_IS_REQUIRE;
        }
        if (timeStartError === TIME_IS_BIGGER_THAN_TIME_CURRENT) {
          return TIME_IS_BIGGER_THAN_TIME_CURRENT;
        }
        return "";
      });
      setTimeEndError(() => {
        if (timeEndError === TIME_IS_NOT_VALID) {
          return TIME_IS_NOT_VALID;
        }
        if (timeEndError === TIME_IS_REQUIRE) {
          return TIME_IS_REQUIRE;
        }
        if (timeEndError === TIME_IS_BIGGER_THAN_TIME_CURRENT) {
          return TIME_IS_BIGGER_THAN_TIME_CURRENT;
        }
        return "";
      });
    }
  }, [timeStart, timeEnd]);

  const isTimeStartSmallerTimeEnd = (timeStartStr: string, timeEndStr: string) => {
    const timeStartTimestamp = convertStringToDate(timeStartStr).getTime();
    const timeEndTimestamp = convertStringToDate(timeEndStr).getTime();
    return timeEndTimestamp >= timeStartTimestamp;
  };

  // check time if time bigger time current
  const isTimeFeature = (timeStartCurrent?: any, timeEndCurrent?: any) => {
    const timeStartFeature = new Date();
    const timeEndFeature = getEndCurrentDateString();
    let check = true;
    if (convertStringToDate(timeStartCurrent).getTime() > timeStartFeature.getTime()) {
      check = false;
    }
    if (
      convertStringToDate(timeEndCurrent).getTime() > convertStringToDate(timeEndFeature).getTime()
    ) {
      check = false;
    }
    return check;
  };

  const handleChangeAutocomplete = (value: string, types: string) => {
    switch (types) {
      case "autocomplete-multiple":
        setValueInputMultiple(value);
        break;
      case "autocomplete":
        setValueInput(value);
        break;
      default:
        setValueInputMultiple(value);
        setValueInput(value);
        break;
    }
  };
  return (
    <Grid item xs={12} md={6} lg={6}>
      <Card>
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          padding={2}
        >
          <MDTypography fontWeight="bold" fontSize={24} mt={2} mb={4} style={{ color: "black" }}>
            {title}
          </MDTypography>
          <MDBox style={{ width: "90%" }}>
            {children}
            {fields.map((field, index) => (
              <Grid container spacing={4} key={`${field.title}`}>
                <Grid item xs={2.5} md={2.5} lg={2.5}>
                  <MDTypography fontSize={16} fontWeight="medium">
                    {field.title}
                  </MDTypography>
                </Grid>
                <Grid item xs={9.5} md={9.5} lg={9.5}>
                  {field.type === "autocomplete-multiple" ? (
                    <MDBox mb={2}>
                      <Autocomplete
                        value={field.checked}
                        key={`fields_${field.label}`}
                        onChange={(event, newOptions) => {
                          field.action(newOptions);
                          if (newOptions) {
                            setValueInputMultiple("");
                          }
                        }}
                        multiple
                        disablePortal
                        disableCloseOnSelect
                        id="tags-filled"
                        options={field.data}
                        // show input value
                        inputValue={field.checked ? field.checked : valueInputMultiple}
                        filterOptions={(optionsFilter: any) => optionsFilter}
                        onKeyDown={(event) => {
                          if (event.code !== "Tab") {
                            event.preventDefault();
                          }
                        }}
                        renderOption={(props, option, { selected }) => (
                          <li {...props} style={{ marginBottom: "5px" }}>
                            <Checkbox
                              icon={icon}
                              checkedIcon={checkedIcon}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {convertEllipsisCharacter(option, 20)}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            placeholder="Search..."
                            onChange={(event) =>
                              handleChangeAutocomplete(event?.target?.value, field.type)
                            }
                          />
                        )}
                        ListboxProps={{ style: { maxHeight: "15rem" } }}
                      />
                    </MDBox>
                  ) : field.type === "autocomplete" ? (
                    <MDBox mb={2}>
                      <Autocomplete
                        value={field.choosedValue || ""}
                        key={`fields_${field.label}`}
                        onChange={(event, newOptions) => {
                          field.action(newOptions);
                          // @ts-ignore
                          if (newOptions) {
                            setValueInput(newOptions);
                          } else {
                            // @ts-ignore
                            setValueInput("");
                          }
                        }}
                        disablePortal
                        id="autocomplete"
                        options={field.data}
                        renderOption={(props, option) => (
                          <MDBox {...props} style={{ marginBottom: "5px" }}>
                            {convertEllipsisCharacter(option, 15)}
                          </MDBox>
                        )}
                        filterOptions={(optionsFilter: any) => optionsFilter}
                        onKeyDown={(event) => {
                          if (event.code !== "Tab") {
                            event.preventDefault();
                          }
                        }}
                        inputValue={field.choosedValue ? field.choosedValue : valueInput}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            placeholder="Search..."
                            onChange={(event: any) => {
                              handleChangeAutocomplete(event?.target?.value, field.type);
                            }}
                          />
                        )}
                        ListboxProps={{ style: { maxHeight: "15rem" } }}
                      />
                    </MDBox>
                  ) : (
                    <MDBox mb={2}>
                      <MDInput
                        value={field.data}
                        type={field.type}
                        label={field.label}
                        fullWidth
                        onChange={(e: any) => field.action(e.target.value)}
                      />
                    </MDBox>
                  )}
                </Grid>
              </Grid>
            ))}

            <Grid container mb={3} spacing={4}>
              <Grid item xs={2.5} md={2.5} lg={2.5}>
                <MDTypography fontSize={16} fontWeight="medium">
                  Thời gian
                </MDTypography>
              </Grid>
              <Grid item xs={9.5} md={9.5} lg={9.5}>
                <MDBox display="flex" flexDirection="row" justifyContent="space-between" gap={2}>
                  <MDDateTimePicker
                    label="Thời gian bắt đầu"
                    datetime={convertStringToDate(timeStart)}
                    handleChooseDateTime={(time: any) => {
                      handleChangeTimeStart(time);
                    }}
                    error={timeStartError}
                  />

                  <MDDateTimePicker
                    label="Thời gian kết thúc"
                    datetime={convertStringToDate(timeEnd)}
                    handleChooseDateTime={(time: any) => {
                      handleChangeTimeEnd(time);
                    }}
                    error={timeEndError}
                  />
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
          <MDButton
            style={{
              background: "#63B967",
              color: "#FFFFFF",
              marginTop: "10px",
              marginBottom: "10px",
            }}
            onClick={() => {
              actionReport(reportLink === "" ? baseReportLink : reportLink);
            }}
            disabled={
              !isTimeFeature(timeStart, timeEnd) ||
              !isTimeStartSmallerTimeEnd(timeStart, timeEnd) ||
              timeStartError ||
              timeEndError
            }
          >
            <Icon>file_download</Icon>
            Xuất báo cáo
          </MDButton>
        </MDBox>
      </Card>
    </Grid>
  );
}
