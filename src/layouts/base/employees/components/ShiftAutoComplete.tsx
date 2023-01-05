import MDBox from "components/bases/MDBox";
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useAuthenController } from "context/authenContext";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ListBox from "../../../../components/customizes/AutoComponent/ListBox";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";

import { validateTextField } from "../../../../components/customizes/ValidateForm";
import { Shift } from "../../../../models/time-keeping/shift";
import { getTimeKeepingShiftApi } from "../../../time-keeping/setting/api";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FieldType = {
  defaultData?: Array<Shift> | null;
  label: string;
  status?: string;
  handleChoose?: any;
};

export default function ShiftAutoComplete({ label, defaultData, handleChoose }: FieldType) {
  const [searchState, setSearchState] = useState<any>("");
  const [options, setOptions] = useState<Array<string>>([]);
  const [shift, setShift] = useState<Array<Shift>>([]);
  const [allShift, setAllShift] = useState<Array<Shift>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // @ts-ignore
  const [authController] = useAuthenController();

  // @ts-ignore
  const fetchData = useCallback(
    async ({ isLoadMore }) => {
      setIsLoaded(true);
      const startTime = new Date().getTime();
      if (authController.token !== null) {
        const getAllShiftResponse: { data: any; messageError?: string } =
          await getTimeKeepingShiftApi(authController.token);
        if (getAllShiftResponse.data !== null) {
          if (isLoadMore) {
            setAllShift((prevState) => [...prevState, ...getAllShiftResponse.data]);
            setShift((prevState) => [...prevState, ...getAllShiftResponse.data]);
          } else {
            setAllShift(getAllShiftResponse.data);
            setShift(getAllShiftResponse.data);
          }
        }
        const endTime = new Date().getTime();
        setTimeout(() => {
          setIsLoaded(false);
        }, 500 - (endTime - startTime));
      }
    },
    [authController.token]
  );

  useEffect(() => {
    setOptions(shift.map((item: Shift) => item.name));
  }, [shift]);

  const getShift = async () => {
    await fetchData({
      isLoadMore: false,
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (validateTextField(searchState) !== "") {
        const searchLocal = allShift.filter(
          (item) =>
            item.name
              .toLocaleLowerCase()
              .indexOf(validateTextField(searchState).toLocaleLowerCase()) !== -1
        );
        setShift(searchLocal);
      } else {
        setShift([]);
      }
      if (validateTextField(searchState) === "") {
        await getShift();
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchState]);

  const handleOnChange = (event: any, newOptions: Array<String>) => {
    event.stopPropagation();
    const shiftChoosed: Array<Shift> = [];
    allShift.forEach((item: Shift) => {
      if (newOptions.includes(`${item.name}`)) {
        shiftChoosed.push(item);
      }
    });
    handleChoose(shiftChoosed);
  };
  return (
    <MDBox mb={2} key={label}>
      <Autocomplete
        // @ts-ignore
        defaultValue={defaultData ? defaultData.map((item) => item.name) : undefined}
        key={`fields_shift_${label}`}
        onChange={(event, newOptions) => {
          handleOnChange(event, newOptions);
          if (newOptions === null) {
            setSearchState("");
          } else {
            setSearchState("");
          }
        }}
        loading={isLoaded}
        // @ts-ignore
        inputValue={searchState}
        multiple
        disablePortal
        disableCloseOnSelect
        id={`${label}_tags-filled`}
        options={options}
        filterOptions={(options1, state) => options1}
        renderOption={(props, option, { selected }) => (
          <li {...props} style={{ marginBottom: "5px" }}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {convertEllipsisCharacter(option, STRING_SHORT_LENGTH_AUTOCOMPLETE)}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder="Search..."
            onChange={({ currentTarget }: any) => {
              setSearchState(currentTarget.value);
            }}
            onClick={() => {
              setSearchState("");
            }}
            autoComplete="off"
          />
        )}
        ListboxProps={{ style: { maxHeight: "15rem" } }}
        ListboxComponent={ListBox}
      />
    </MDBox>
  );
}
