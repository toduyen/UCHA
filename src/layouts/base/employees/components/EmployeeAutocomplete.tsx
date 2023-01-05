import MDBox from "components/bases/MDBox";
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { getAllEmployeesApi } from "layouts/base/employees/api";
import { useAuthenController } from "context/authenContext";
import { Employee } from "models/base/employee";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ListBox from "../../../../components/customizes/AutoComponent/ListBox";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FieldType = {
  defaultData?: Array<Employee> | null;
  label: string;
  type: "autocomplete" | "autocomplete-multiple";
  PopperComponent?: any;
  handleChoose: (employees: Array<Employee>) => void;
  status?: string;
  minWidth?: number;
  error?: string;
};

export default function EmployeeAutocomplete({
  label,
  handleChoose,
  defaultData,
  PopperComponent,
  type,
  status,
  minWidth = 250,
  error,
}: FieldType) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [searchState, setSearchState] = useState("");
  const [options, setOptions] = useState<Array<string>>([]);
  const [employees, setEmployees] = useState<Array<Employee>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // @ts-ignore
  const [authController] = useAuthenController();
  const [errorState, setErrorState] = useState(error);

  useEffect(() => {
    setErrorState(error);
  }, [error]);
  const [valueChoose, setValueChoose] = useState<string>("");

  // @ts-ignore
  const fetchData = useCallback(
    // eslint-disable-next-line no-shadow
    async ({ page, size, search, isLoadMore, status }) => {
      setIsLoaded(true);
      const startTime = new Date().getTime();
      if (authController.token !== null) {
        const getAllEmployeesResponse = await getAllEmployeesApi({
          token: authController.token,
          page,
          size,
          search,
          status,
        });
        if (getAllEmployeesResponse.data !== null) {
          setTotalPage(getAllEmployeesResponse.data.pageCount);
          if (isLoadMore) {
            setEmployees((prevState) => [...prevState, ...getAllEmployeesResponse.data.data]);
          } else {
            setEmployees(getAllEmployeesResponse.data.data);
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

  // @ts-ignore
  useEffect(() => {
    if (authController.token) {
      fetchData({ page: 0, size: 10, isLoadMore: false, status }).catch(console.error);
    }
  }, [authController.token]);

  const loadMoreResults = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchData({ page: nextPage, size: 10, isLoadMore: true, status }).catch(console.error);
  };

  useEffect(() => {
    setOptions(employees.map((item: Employee) => `${item.code}-${item.name}`));
  }, [employees]);
  const getEmployee = async (searchData: string) => {
    await fetchData({
      page: 0,
      size: 10,
      search: searchData.trim(),
      isLoadMore: false,
      status,
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      await getEmployee(valueChoose && type === "autocomplete" ? "" : searchState);
    }, 1500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchState, valueChoose]);

  useEffect(() => {
    if (defaultData && defaultData?.length > 0 && type === "autocomplete") {
      const combineData = `${defaultData[0]?.code}-${defaultData[0]?.name}`;
      setSearchState(combineData);
    }
  }, [defaultData]);

  useEffect(() => {
    if (searchState.trim() === "") {
      setValueChoose("");
    }
  }, [searchState]);

  const handleScroll = (event: any) => {
    const currentNode = event.currentTarget;
    const x = currentNode.scrollTop + currentNode.clientHeight;
    if (currentNode.scrollHeight - x <= 1) {
      if (currentPage < totalPage - 1) {
        loadMoreResults();
      }
    }
  };

  const handleOnChange = (event: any, newOption: Array<string>) => {
    event.stopPropagation();
    setErrorState("");
    const employeeChooses: Array<Employee> = [];
    employees.forEach((item: Employee) => {
      if (newOption.includes(`${item.code}-${item.name}`)) {
        employeeChooses.push(item);
        setValueChoose(item.code);
      }
    });
    handleChoose(employeeChooses);
  };
  const handleOnBlur = () => {
    if (searchState.trim() === "" && type === "autocomplete") {
      handleChoose([]);
    }
    if (errorState) {
      return errorState;
    }
    return "";
  };
  return (
    <MDBox mb={2} key={label}>
      {type === "autocomplete" ? (
        <Autocomplete
          value={searchState || null}
          sx={{ minWidth: `${minWidth}px` }}
          key="field_employee"
          onChange={(event, newOption) => {
            handleOnChange(event, newOption ? Array.of(newOption) : []);
            // @ts-ignore
            if (newOption !== null) {
              setSearchState(newOption);
            }
          }}
          loading={isLoaded}
          disablePortal
          noOptionsText="Không tìm thấy nhân sự phù hợp"
          id="employee-autocomplete"
          options={options}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
              handleChoose([]);
              setValueChoose("");
            }
          }}
          inputValue={searchState}
          renderOption={(props, option) => (
            <MDBox {...props} style={{ marginBottom: "5px" }}>
              {convertEllipsisCharacter(option, STRING_SHORT_LENGTH_AUTOCOMPLETE)}
            </MDBox>
          )}
          filterOptions={(options1, state) => options1}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder="Search..."
              onChange={({ currentTarget }: any) => {
                setSearchState(currentTarget.value);
                setErrorState("");
              }}
              onClick={() => setValueChoose("Click")}
              error={!!errorState}
              helperText={errorState}
            />
          )}
          onBlur={handleOnBlur}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
        />
      ) : (
        <Autocomplete
          defaultValue={
            defaultData ? defaultData.map((item) => `${item.code}-${item.name}`) : undefined
          }
          key={`fields_${label}`}
          onChange={(event, newOptions) => {
            handleOnChange(event, newOptions);
            if (newOptions !== null) {
              setSearchState("");
            }
          }}
          loading={isLoaded}
          multiple
          disablePortal
          disableCloseOnSelect
          id="tags-filled"
          options={options}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
              handleChoose([]);
              setValueChoose("");
            }
          }}
          // show input value
          inputValue={searchState}
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
          filterOptions={(options1, state) => options1}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder="Search..."
              onChange={({ currentTarget }: any) => {
                setSearchState(currentTarget.value);
                setErrorState("");
              }}
              onClick={() => {
                setSearchState("");
              }}
              error={!!errorState}
              helperText={errorState}
            />
          )}
          onBlur={handleOnBlur}
          PopperComponent={PopperComponent}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
        />
      )}
    </MDBox>
  );
}
