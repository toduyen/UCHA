import MDBox from "components/bases/MDBox";
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useAuthenController } from "context/authenContext";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Location } from "../../../../models/base/location";
import ListBox from "../../../../components/customizes/AutoComponent/ListBox";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";
import { getAllRoleApi } from "../../users/api";
import { Role } from "../../../../models/base/role";
import { validateTextField } from "../../../../components/customizes/ValidateForm";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FieldType = {
  defaultData?: Array<Role> | null;
  label: string;
  type: "autocomplete" | "autocomplete-multiple";
  location?: Location;
  status?: string;
  action?: any;
  actionBlur?: any;
  error?: any;
};

export default function RoleAutoComplete({
  label,
  defaultData,
  type,
  action,
  actionBlur,
  error,
}: FieldType) {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchState, setSearchState] = useState<any>("");
  const [options, setOptions] = useState<Array<string>>([]);
  const [role, setRole] = useState<Array<Role>>([]);
  const [allRole, setAllRole] = useState<Array<Role>>([]);
  const [valueChoissed, setValueChoissed] = useState<Array<any>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // @ts-ignore
  const [authController] = useAuthenController();

  // validate form filter
  const [valueInputMultiple, setValueInputMultiple] = React.useState<string>("");
  const [valueInput, setValueInput] = React.useState<string>("");

  // @ts-ignore
  const fetchData = useCallback(
    async ({ isLoadMore }) => {
      setIsLoaded(true);
      const startTime = new Date().getTime();
      if (authController.token !== null) {
        const getAllRoleResponse: { data: any; messageError?: string } = await getAllRoleApi(
          authController.token
        );
        if (getAllRoleResponse.data !== null) {
          if (isLoadMore) {
            setAllRole((prevState) => [...prevState, ...getAllRoleResponse.data]);
            setRole((prevState) => [...prevState, ...getAllRoleResponse.data]);
          } else {
            setAllRole(getAllRoleResponse.data);
            setRole(getAllRoleResponse.data);
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

  const loadMoreResults = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchData({ isLoadMore: true }).catch(console.error);
  };

  useEffect(() => {
    setOptions(role.map((item: Role) => item.name));
  }, [role]);

  const getRole = async () => {
    await fetchData({
      isLoadMore: false,
    });
  };

  const handleScroll = (event: any) => {
    const currentNode = event.currentTarget;
    const x = currentNode.scrollTop + currentNode.clientHeight;
    if (currentNode.scrollHeight - x <= 1) {
      loadMoreResults();
    }
  };
  useEffect(() => {
    const fnDebounce = setTimeout(() => {
      if (type === "autocomplete") {
        let userChooses: string = "";
        if (searchState !== "") {
          role.forEach((item: any) => {
            if (searchState.includes(item.name)) {
              userChooses = item.name;
            }
          });
          action(userChooses);
        }
      }
    }, 500);
    return () => clearTimeout(fnDebounce);
  }, [role, searchState]);

  const handleOnChange = (event: any, newOption: Array<string>) => {
    event.stopPropagation();
    const roleChooses: Array<Role> = [];
    role.forEach((item: any) => {
      if (newOption.includes(item.name)) {
        roleChooses.push(item);
      }
    });
    setValueChoissed(roleChooses);
  };

  const handleOnBlur = () => {
    if (actionBlur) {
      if (valueChoissed?.length > 0 || defaultData !== undefined) {
        actionBlur("");
        setValueInputMultiple("");
      } else return "";
    }
    return error;
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (validateTextField(searchState) !== "") {
        const searchLocal = allRole.filter(
          (item) =>
            item.name
              .toLocaleLowerCase()
              .indexOf(validateTextField(searchState).toLocaleLowerCase()) !== -1
        );
        setRole(searchLocal);
      } else {
        setRole([]);
      }
      if (
        validateTextField(searchState) === "" ||
        (searchState.trim() !== "" && type === "autocomplete")
      ) {
        await getRole();
      }
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchState]);

  useEffect(() => {
    if (defaultData && defaultData?.length > 0 && type === "autocomplete") {
      // @ts-ignore
      setValueInput(defaultData);
    }
  }, [defaultData]);

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
    <MDBox mb={2} key={label}>
      {type === "autocomplete" ? (
        <Autocomplete
          // @ts-ignore
          value={valueInput || null}
          sx={{ minWidth: "250px" }}
          key="field_role"
          // @ts-ignore
          inputValue={valueInput}
          onChange={(event, newOption) => {
            handleOnChange(event, newOption ? Array.of(newOption) : []);
            action(newOption);
            if (newOption === null) {
              setSearchState("");
            }
            // @ts-ignore
            if (newOption) {
              setValueInput(newOption);
            } else {
              // @ts-ignore
              setValueInput("");
            }
          }}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
              action("");
            }
          }}
          loading={isLoaded}
          disablePortal
          noOptionsText="Không tìm thấy quyền phù hợp"
          id="camera-autocomplete"
          // @ts-ignore
          options={options}
          filterOptions={(options1, state) => options1}
          renderOption={(props, option) => (
            <MDBox {...props} style={{ marginBottom: "5px" }}>
              {convertEllipsisCharacter(option, STRING_SHORT_LENGTH_AUTOCOMPLETE)}
            </MDBox>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder="Search..."
              onChange={({ currentTarget }: any) => {
                setSearchState(currentTarget.value);
                handleChangeAutocomplete(currentTarget?.value, type);
              }}
              error={!!error}
              helperText={error}
            />
          )}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
          onBlur={() => handleOnBlur()}
        />
      ) : (
        <Autocomplete
          // @ts-ignore
          defaultValue={defaultData ? defaultData.map((item) => item) : undefined}
          key={`fields_role_${label}`}
          onChange={(event, newOptions) => {
            handleOnChange(event, newOptions);
            action(newOptions);
            if (newOptions === null) {
              setSearchState("");
              setValueInputMultiple("");
            } else {
              setSearchState("");
            }
          }}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
              action("");
            }
          }}
          loading={isLoaded}
          // @ts-ignore
          inputValue={searchState}
          multiple
          disablePortal
          disableCloseOnSelect
          id="tags-filled"
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
              error={!!error}
              helperText={error}
            />
          )}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
          onBlur={() => handleOnBlur()}
        />
      )}
    </MDBox>
  );
}
