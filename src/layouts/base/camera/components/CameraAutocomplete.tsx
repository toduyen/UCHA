import MDBox from "components/bases/MDBox";
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useAuthenController } from "context/authenContext";
import { Camera } from "models/base/camera";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { getAllCameraApi } from "../api";
import { Location } from "../../../../models/base/location";
import ListBox from "../../../../components/customizes/AutoComponent/ListBox";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FieldType = {
  defaultData?: Array<Camera> | null;
  label: string;
  type: "autocomplete" | "autocomplete-multiple";
  handleChoose: (cameras: Array<Camera>) => void;
  location?: Location;
  status?: string;
};

export default function CameraAutocomplete({
  label,
  handleChoose,
  defaultData,
  type,
  location,
  status,
}: FieldType) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [searchState, setSearchState] = useState("");
  const [options, setOptions] = useState<Array<string>>([]);
  const [cameras, setCameras] = useState<Array<Camera>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [valueChoose, setValueChoose] = useState<string>("");
  // @ts-ignore
  const [authController] = useAuthenController();

  // @ts-ignore
  const fetchData = useCallback(
    async ({ page, size, search, isLoadMore, status }) => {
      setIsLoaded(true);
      const startTime = new Date().getTime();
      if (authController.token !== null) {
        const getAllCamerasResponse: { data: any; messageError?: string } = await getAllCameraApi({
          token: authController.token,
          locationId: location ? location.id : undefined,
          page,
          size,
          search,
          status,
        });

        if (getAllCamerasResponse.data !== null) {
          setTotalPage(getAllCamerasResponse.data.pageCount);
          if (isLoadMore) {
            setCameras((prevState) => [...prevState, ...getAllCamerasResponse.data.data]);
          } else {
            setCameras(getAllCamerasResponse.data.data);
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
    setOptions(cameras.map((item: Camera) => item.name));
  }, [cameras]);

  const getAllCamera = async (searchData: string) => {
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
      await getAllCamera(valueChoose && type === "autocomplete" ? "" : searchState);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchState, valueChoose]);

  useEffect(() => {
    if (defaultData && defaultData?.length > 0 && type === "autocomplete") {
      const combineData = `${defaultData[0].name}`;
      setSearchState(combineData);
    }
  }, [defaultData]);

  useEffect(() => {
    if (type === "autocomplete") {
      const userChooses: Array<Camera> = [];
      cameras.forEach((item: any) => {
        if (searchState.includes(item.name)) {
          userChooses.push(item);
        }
      });
      handleChoose(userChooses);
    }
  }, [cameras]);

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
    const cameraChooses: Array<Camera> = [];
    cameras.forEach((item: Camera) => {
      if (newOption.includes(item.name)) {
        cameraChooses.push(item);
        setValueChoose(item.name);
      }
    });
    handleChoose(cameraChooses);
  };

  const getColor = (option: string) => {
    // @ts-ignore
    const tmp = cameras.filter((item: Camera) => `${item.name}` === option);
    if (tmp?.length > 0) {
      if (tmp[0].status === "deleted") {
        return "red";
      }
    }
    return "inherit";
  };
  const handleOnBlur = () => {
    if (searchState.trim() === "" && type === "autocomplete") {
      handleChoose([]);
    }
    return "";
  };
  return (
    <MDBox mb={2} key={label}>
      {type === "autocomplete" ? (
        <Autocomplete
          value={searchState || null}
          sx={{ minWidth: "250px" }}
          key="field_camera"
          onChange={(event, newOption) => {
            handleOnChange(event, newOption ? Array.of(newOption) : []);
            // @ts-ignore
            if (newOption !== null) {
              setSearchState(newOption);
              handleChoose([]);
              setValueChoose("");
            }
          }}
          loading={isLoaded}
          disablePortal
          noOptionsText="Không tìm thấy camera phù hợp"
          id="camera-autocomplete"
          options={options}
          onInputChange={(event, newInputValue, reason) => {
            if (reason !== "reset") {
              setSearchState("");
            }
          }}
          filterOptions={(options1, state) => options1}
          renderOption={(props, option) => (
            <MDBox {...props} style={{ marginBottom: "5px", color: getColor(option) }}>
              {convertEllipsisCharacter(option, STRING_SHORT_LENGTH_AUTOCOMPLETE)}
            </MDBox>
          )}
          inputValue={searchState}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder="Search..."
              onChange={({ currentTarget }: any) => {
                setSearchState(currentTarget.value);
              }}
              onClick={() => setValueChoose("Click")}
            />
          )}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
          onBlur={handleOnBlur}
        />
      ) : (
        <Autocomplete
          defaultValue={defaultData ? defaultData.map((item) => item.name) : undefined}
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
          inputValue={searchState}
          filterOptions={(options1, state) => options1}
          renderOption={(props, option, { selected }) => (
            <li {...props} style={{ marginBottom: "5px", color: getColor(option) }}>
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
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
          onBlur={handleOnBlur}
        />
      )}
    </MDBox>
  );
}
