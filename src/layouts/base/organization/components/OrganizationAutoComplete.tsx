import MDBox from "components/bases/MDBox";
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useAuthenController } from "context/authenContext";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { getAllOrganizationApi } from "../api";
import { Location } from "../../../../models/base/location";
import ListBox from "../../../../components/customizes/AutoComponent/ListBox";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";
import { Organization } from "../../../../models/base/organization";
import { Camera } from "../../../../models/base/camera";
import { User } from "../../../../models/base/user";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FieldType = {
  defaultData?: Array<Organization> | null;
  label: string;
  type: "autocomplete" | "autocomplete-multiple";
  location?: Location;
  status?: string;
  action?: any;
  actionBlur?: any;
  error?: any;
};

export default function OrganizationAutoComplete({
  label,
  defaultData,
  type,
  action,
  actionBlur,
  error,
}: FieldType) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [searchState, setSearchState] = useState("");
  const [options, setOptions] = useState<Array<string>>([]);
  const [organization, setOrganization] = useState<Array<Organization>>([]);
  const [valueChoissed, setValueChoissed] = useState<Array<any>>([]);
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
        const getAllOrganizationResponse: { data: any; messageError?: string } =
          await getAllOrganizationApi({
            token: authController.token,
            page,
            size,
            search,
          });

        if (getAllOrganizationResponse.data !== null) {
          setTotalPage(getAllOrganizationResponse.data.pageCount);
          if (isLoadMore) {
            setOrganization((prevState) => [...prevState, ...getAllOrganizationResponse.data.data]);
          } else {
            setOrganization(getAllOrganizationResponse.data.data);
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
    setOptions(organization.map((item: Organization) => item.name));
  }, [organization]);

  const getOrganization = async (searchData: string) => {
    await fetchData({
      page: 0,
      size: 10,
      search: searchData.trim(),
      isLoadMore: false,
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      await getOrganization(valueChoose && type === "autocomplete" ? "" : searchState);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchState, valueChoose]);

  useEffect(() => {
    if (type === "autocomplete") {
      let userChooses: string = "";
      organization.forEach((item: any) => {
        if (searchState.includes(item.name)) {
          userChooses = item.name;
        }
      });
      action(userChooses);
    }
  }, [organization]);
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
    const organizationChooses: Array<Camera> = [];
    organization.forEach((item: any) => {
      if (newOption.includes(item.name)) {
        organizationChooses.push(item);
        setValueChoose(item?.name);
      }
    });
    setValueChoissed(organizationChooses);
  };

  const handleOnBlur = () => {
    if (actionBlur) {
      if (searchState.trim() === "" && type === "autocomplete") {
        setValueChoissed([]);
      }
      if (valueChoissed?.length > 0) {
        actionBlur("");
      } else return "";
    }
    return error;
  };

  useEffect(() => {
    if (defaultData && defaultData?.length > 0 && type === "autocomplete") {
      // @ts-ignore
      setSearchState(defaultData[0].name);
    }
  }, [defaultData]);

  return (
    <MDBox mb={2} key={label}>
      {type === "autocomplete" ? (
        <Autocomplete
          value={searchState || null}
          sx={{ minWidth: "250px" }}
          key="field_organization"
          onChange={(event, newOption) => {
            handleOnChange(event, newOption ? Array.of(newOption) : []);
            action(newOption);
            // @ts-ignore
            if (newOption !== null) {
              setSearchState(newOption);
            }
          }}
          loading={isLoaded}
          disablePortal
          noOptionsText="Không tìm thấy tổ chức phù hợp"
          id="camera-autocomplete"
          options={options}
          // view data
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
              action("");
              setValueChoose("");
            }
          }}
          inputValue={searchState}
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
              }}
              onClick={() => setValueChoose("Click")}
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
          defaultValue={defaultData ? defaultData.map((item) => item.name) : undefined}
          key={`fields_${label}`}
          onChange={(event, newOptions) => {
            handleOnChange(event, newOptions);
            action(newOptions);
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
              action("");
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
