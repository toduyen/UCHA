import MDBox from "components/bases/MDBox";
import React, { useCallback, useEffect, useState } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { useAuthenController } from "context/authenContext";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ListBox from "../../../../components/customizes/AutoComponent/ListBox";
import { User } from "models/base/user";
import { getAllUserApi } from "../api";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH_AUTOCOMPLETE } from "../../../../constants/app";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type FieldType = {
  defaultData?: Array<User> | null;
  label: string;
  type: "autocomplete" | "autocomplete-multiple";
  handleChoose: (users: Array<User>) => void;
  status?: string;
};

export default function UserAutocomplete({
  label,
  handleChoose,
  defaultData,
  type,
  status,
}: FieldType) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [searchState, setSearchState] = useState("");
  const [options, setOptions] = useState<Array<string>>([]);
  const [users, setUsers] = useState<Array<User>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [valueChoose, setValueChoose] = useState<string>("");
  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const fetchData = useCallback(
    async ({ isLoadMore, page, size, search, status }) => {
      setIsLoaded(true);
      const startTime = new Date().getTime();
      if (authController.token !== null) {
        const getAllUserResponse: { data: any; messageError?: string } = await getAllUserApi({
          token: authController.token,
          status,
          page,
          size,
          search,
        });
        if (getAllUserResponse.data !== null) {
          setTotalPage(getAllUserResponse.data.pageCount);
          if (isLoadMore) {
            setUsers((prevState) => [...prevState, ...getAllUserResponse.data.data]);
          } else {
            setUsers(getAllUserResponse.data.data);
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
    // @ts-ignore
    setOptions([
      ...users.map((item: User) => `${item.username}`),
      `${authController.currentUser.username}`,
    ]);
  }, [users]);
  const getUser = async (searchData: string) => {
    await fetchData({ page: 0, size: 10, search: searchData, isLoadMore: false, status });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      await getUser(valueChoose && type === "autocomplete" ? "" : searchState);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [searchState, valueChoose]);

  useEffect(() => {
    if (defaultData && defaultData?.length > 0 && type === "autocomplete") {
      const combineData = `${defaultData[0]?.username}`;
      setSearchState(combineData);
    }
  }, [defaultData]);

  useEffect(() => {
    if (type === "autocomplete") {
      const userChooses: Array<User> = [];
      const admin = authController?.currentUser;
      users.forEach((item: User) => {
        if (searchState.includes(`${item.username}`)) {
          userChooses.push(item);
        }
      });
      if (searchState.includes(admin.username)) {
        userChooses.push(admin);
      }
      handleChoose(userChooses);
    }
  }, [users]);

  useEffect(() => {
    if (searchState.trim() === "") {
      setValueChoose("");
    }
  }, [searchState]);

  useEffect(() => {
    // @ts-ignore
    const uniqueUser = [...new Set(users)];
    // @ts-ignore
    const uniqueUserWidthCurrentAcc = [...new Set(users.concat(authController?.currentUser))];
    const dataCurrentAcc = () => {
      setOptions([...uniqueUserWidthCurrentAcc.map((item: User) => `${item.username}`)]);
    };
    if (searchState.trim() === "" && valueChoose === "") {
      dataCurrentAcc();
    }
    if (searchState) {
      setOptions([...uniqueUser.map((item: User) => `${item.username}`)]);
    }
    if (valueChoose) {
      dataCurrentAcc();
    }
    if (searchState && searchState === authController?.currentUser.username) {
      dataCurrentAcc();
    }
  }, [users, authController?.currentUser, valueChoose]);

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
    const userChooses: Array<User> = [];
    // @ts-ignore
    users.push(authController.currentUser);
    // @ts-ignore
    users.forEach((item: User) => {
      if (newOption.includes(`${item.username}`)) {
        userChooses.push(item);
        setValueChoose(item.username);
      }
    });
    handleChoose(userChooses);
  };

  const getColor = (option: string) => {
    // @ts-ignore
    const tmp = users.filter((item: User) => `${item.username}` === option);
    if (tmp?.length > 0) {
      if (tmp[0].status === "deleted") {
        return "red";
      }
      if (tmp[0].status === "pending") {
        return "success";
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
          key="field_user"
          onChange={(event, newOption) => {
            handleOnChange(event, newOption ? Array.of(newOption) : []);
            // @ts-ignore
            if (newOption !== null) {
              setSearchState(newOption);
            }
          }}
          loading={isLoaded}
          disablePortal
          noOptionsText="Không tìm thấy tài khoản phù hợp"
          id="user-autocomplete"
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
              onClick={() => setValueChoose("Click")}
            />
          )}
          ListboxProps={{ style: { maxHeight: "15rem" }, onScroll: handleScroll }}
          ListboxComponent={ListBox}
          onBlur={handleOnBlur}
        />
      ) : (
        <Autocomplete
          defaultValue={
            defaultData ? defaultData.map((item) => `${item.id}-${item.username}`) : undefined
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
