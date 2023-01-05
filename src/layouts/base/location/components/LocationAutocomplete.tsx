import MDBox from "components/bases/MDBox";
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useAuthenController } from "context/authenContext";
import { Location } from "models/base/location";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { getAllLocationApi } from "../api";
import ListBox from "../../../../components/customizes/AutoComponent/ListBox";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FieldType = {
  defaultData?: Array<Location> | null;
  label: string;
  type: "autocomplete" | "autocomplete-multiple";
  handleChoose: (locations: Array<Location>) => void;
  error?: string;
};

export default function LocationAutocomplete({
  label,
  handleChoose,
  defaultData,
  type,
  error,
}: FieldType) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [searchState, setSearchState] = useState("");
  const [options, setOptions] = useState<Array<string>>([]);
  const [locations, setLocations] = useState<Array<Location>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [valueChoose, setValueChoose] = useState<string>("");
  // @ts-ignore
  const [authController] = useAuthenController();

  // @ts-ignore
  const fetchData = useCallback(
    async ({ page, size, search, isLoadMore }) => {
      setIsLoaded(true);
      const startTime = new Date().getTime();
      if (authController.token !== null) {
        const getAllLocationsResponse = await getAllLocationApi({
          token: authController.token,
          page,
          size,
          search,
        });

        if (getAllLocationsResponse.data !== null) {
          setTotalPage(getAllLocationsResponse.data.pageCount);
          if (isLoadMore) {
            setLocations((prevState) => [...prevState, ...getAllLocationsResponse.data.data]);
          } else {
            setLocations(getAllLocationsResponse.data.data);
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
      fetchData({ page: 0, size: 10, isLoadMore: false }).catch(console.error);
    }
  }, [authController.token]);

  const loadMoreResults = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchData({ page: nextPage, size: 10, isLoadMore: true }).catch(console.error);
  };

  useEffect(() => {
    setOptions(locations.map((item: Location) => `${item.code}-${item.name}`));
  }, [locations]);
  const getLocation = async (searchData: string) => {
    await fetchData({ page: 0, size: 10, search: searchData, isLoadMore: false });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      await getLocation(valueChoose && type === "autocomplete" ? "" : searchState);
    }, 1500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchState, valueChoose]);

  useEffect(() => {
    if (defaultData && defaultData?.length > 0 && type === "autocomplete") {
      const combineData = `${defaultData[0].code}-${defaultData[0].name}`;
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
    const locationChooses: Array<Location> = [];
    locations.forEach((item: Location) => {
      if (newOption.includes(`${item.code}-${item.name}`)) {
        locationChooses.push(item);
        setValueChoose(item.code);
      }
    });
    handleChoose(locationChooses);
  };

  const handleOnBlur = () => {
    if (searchState.trim() === "" && type === "autocomplete") {
      handleChoose([]);
    }
    if (error) {
      return error;
    }
    return "";
  };
  return (
    <MDBox mb={2} key={label}>
      {type === "autocomplete" ? (
        <Autocomplete
          value={searchState || null}
          sx={{ minWidth: "250px" }}
          key="field_location"
          onChange={(event, newOption) => {
            handleOnChange(event, newOption ? Array.of(newOption) : []);
            // @ts-ignore
            if (newOption !== null) {
              setSearchState(newOption);
            }
          }}
          loading={isLoaded}
          renderOption={(props, option) => (
            <MDBox {...props} style={{ marginBottom: "5px" }}>
              {convertEllipsisCharacter(option, STRING_SHORT_LENGTH_AUTOCOMPLETE)}
            </MDBox>
          )}
          inputValue={searchState}
          disablePortal
          noOptionsText="Không tìm thấy chi nhánh phù hợp"
          id="location-autocomplete"
          options={options}
          filterOptions={(options1, state) => options1}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
              handleChoose([]);
              setValueChoose("");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder="Search..."
              onChange={({ currentTarget }: any) => {
                setSearchState(currentTarget.value);
              }}
              onClick={() => setValueChoose("Click")}
              error={!!error}
              helperText={error}
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
          onChange={(event, newOption) => {
            handleOnChange(event, newOption);
            if (newOption !== null) {
              setSearchState("");
            }
          }}
          loading={isLoaded}
          multiple
          disablePortal
          // @ts-ignore
          inputValue={searchState}
          disableCloseOnSelect
          id="tags-filled"
          options={options}
          filterOptions={(options1, state) => options1}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
              handleChoose([]);
              setValueChoose("");
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
            />
          )}
          onBlur={handleOnBlur}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
        />
      )}
    </MDBox>
  );
}
