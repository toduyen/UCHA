import MDBox from "components/bases/MDBox";
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useAuthenController } from "context/authenContext";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { getAllAreaRestrictionApi } from "../api";
import { AreaRestriction } from "../../../../models/area-restriction/areaRestriction";
import ListBox from "../../../../components/customizes/AutoComponent/ListBox";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FieldType = {
  defaultData?: Array<AreaRestriction> | null;
  label: string;
  type: "autocomplete" | "autocomplete-multiple";
  handleChoose: (areaRestrictions: Array<AreaRestriction>) => void;
  PopperComponent?: any;
  wrapperTextFieldClassName?: string;
  minWidth?: number;
  error?: string;
};

export default function AreaRestrictionAutocomplete({
  label,
  handleChoose,
  defaultData,
  type,
  PopperComponent,
  wrapperTextFieldClassName,
  minWidth = 250,
  error,
}: FieldType) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [searchState, setSearchState] = useState("");
  const [options, setOptions] = useState<Array<string>>([]);
  const [areaRestrictions, setAreaRestrictions] = useState<Array<AreaRestriction>>([]);
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
        const getAllAreaRestrictionsResponse = await getAllAreaRestrictionApi({
          token: authController.token,
          page,
          size,
          search,
        });

        if (getAllAreaRestrictionsResponse.data !== null) {
          setTotalPage(getAllAreaRestrictionsResponse.data.pageCount);
          if (isLoadMore) {
            setAreaRestrictions((prevState) => [
              ...prevState,
              ...getAllAreaRestrictionsResponse.data.data,
            ]);
          } else {
            setAreaRestrictions(getAllAreaRestrictionsResponse.data.data);
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
    setOptions(
      areaRestrictions.map((item: AreaRestriction) => `${item.areaCode}-${item.areaName}`)
    );
  }, [areaRestrictions]);

  const getAreaRestriction = async (searchData: string) => {
    await fetchData({ page: 0, size: 10, search: searchData, isLoadMore: false });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      await getAreaRestriction(valueChoose && type === "autocomplete" ? "" : searchState);
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchState, valueChoose]);

  useEffect(() => {
    if (defaultData && defaultData?.length > 0 && type === "autocomplete") {
      const combineData = `${defaultData[0].areaCode}-${defaultData[0].areaName}`;
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
    const areaRestrictionChooses: Array<AreaRestriction> = [];
    areaRestrictions.forEach((item: AreaRestriction) => {
      if (newOption.includes(`${item.areaCode}-${item.areaName}`)) {
        areaRestrictionChooses.push(item);
        setValueChoose(item.areaCode);
      }
    });
    handleChoose(areaRestrictionChooses);
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
          PopperComponent={PopperComponent}
          sx={{ minWidth: `${minWidth}px` }}
          key="field_areaRestriction"
          onChange={(event, newOption) => {
            handleOnChange(event, newOption ? Array.of(newOption) : []);
            // @ts-ignore
            if (newOption !== null) {
              setSearchState(newOption);
            }
          }}
          loading={isLoaded}
          disablePortal
          noOptionsText="Không tìm thấy KVHC phù hợp"
          id="areaRestriction-autocomplete"
          options={options}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
              handleChoose([]);
              setValueChoose("");
            }
          }}
          filterOptions={(options1, state) => options1}
          renderOption={(props, option) => (
            <MDBox {...props} style={{ marginBottom: "5px" }}>
              {convertEllipsisCharacter(option, STRING_SHORT_LENGTH_AUTOCOMPLETE)}
            </MDBox>
          )}
          inputValue={searchState}
          renderInput={(params) => (
            <TextField
              className={wrapperTextFieldClassName}
              {...params}
              label={label}
              placeholder="Search..."
              onChange={({ currentTarget }: any) => {
                setSearchState(currentTarget.value);
              }}
              onClick={() => setValueChoose("Click")}
              error={!!error}
              helperText={error}
              onBlur={handleOnBlur}
            />
          )}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
          onBlur={handleOnBlur}
        />
      ) : (
        <Autocomplete
          defaultValue={
            defaultData ? defaultData.map((item) => `${item.areaCode}-${item.areaName}`) : undefined
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
          // @ts-ignore
          inputValue={searchState}
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
              error={error ? true : false}
              helperText={error}
              onBlur={handleOnBlur}
            />
          )}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
          onBlur={handleOnBlur}
        />
      )}
    </MDBox>
  );
}
