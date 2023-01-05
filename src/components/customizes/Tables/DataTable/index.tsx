import React, { useEffect, useMemo, useRef, useState } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-table components
import { useGlobalFilter, usePagination, useRowSelect, useSortBy, useTable } from "react-table";

// @mui material components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";

// Material Dashboard 2 React components
import MDBox from "components/bases/MDBox";
import MDTypography from "components/bases/MDTypography";
import MDInput from "components/bases/MDInput";
import MDPagination from "components/bases/MDPagination";
import InputAdornment from "@mui/material/InputAdornment";

// Material Dashboard 2 React example components
import DataTableHeadCell from "components/customizes/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "components/customizes/Tables/DataTable/DataTableBodyCell";
import { Checkbox } from "@mui/material";
import {
  hideLoading,
  showLoading,
  useSnackbarController,
} from "../../../../context/snackbarContext";
import { validateTextField } from "../../ValidateForm";
// @ts-ignore
import convertCharacterToHex from "../../ConvertCharacterToHex";
import { useAuthenController } from "../../../../context/authenContext";
import { MAX_LENGTH_STRING } from "../../../../constants/app";

// eslint-disable-next-line react/prop-types
const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }: any, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    // @ts-ignore
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <Checkbox ref={resolvedRef} {...rest} />;
});

type Props = {
  entriesPerPage: any;
  canSearch: boolean;
  showTotalEntries: boolean;
  table: { columns: any; rows: any };
  pagination: any;
  isSorted: boolean;
  noEndBorder: boolean;
  showCheckAll: boolean;
  fetchData?: ({
    page,
    size,
    search,
  }: {
    page: number;
    size: number;
    search: string;
  }) => Promise<void>;
  pageCount?: number;
  itemCount?: number;
  formFilter?: (pageSize: number, search: string) => React.ReactElement;
};

function DataTable({
  entriesPerPage,
  canSearch,
  showTotalEntries,
  table,
  pagination,
  isSorted,
  noEndBorder,
  showCheckAll,
  fetchData,
  pageCount: controlledPageCount,
  itemCount,
  formFilter,
}: Props) {
  const defaultValue = entriesPerPage.defaultValue ? entriesPerPage.defaultValue : 10;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el: any) => el.toString())
    : ["5", "10", "15", "20", "25"];
  const columns = useMemo(() => table.columns, [table]);
  const data = useMemo(() => table.rows, [table]);
  const manualPagination = !!controlledPageCount;
  const [pageValue, setPageValue] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // @ts-ignore
  const [authController] = useAuthenController();

  const [token, setToken] = useState(null);

  useEffect(() => {
    if (token !== authController.token) {
      setToken(authController.token);
    }
  }, [authController.token]);

  // @ts-ignore
  const [, snackbarDispatch] = useSnackbarController();

  const tableInstance = useTable(
    {
      columns,
      data,
      // @ts-ignore
      initialState: { pageIndex: 0 },
      manualPagination,
      manualSortBy: true,
      autoResetPage: false,
      pageCount: controlledPageCount,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      // eslint-disable-next-line no-shadow
      hooks.visibleColumns.push((columns) =>
        showCheckAll
          ? [
              // Let's make a column for selection
              {
                id: "selection",
                // eslint-disable-next-line react/prop-types,react/no-unstable-nested-components
                Header: ({ getToggleAllRowsSelectedProps }: any) => (
                  <div>
                    <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                  </div>
                ),
                // eslint-disable-next-line react/prop-types,react/no-unstable-nested-components
                Cell: ({ row }: any) => (
                  <div>
                    {/* eslint-disable-next-line react/prop-types */}
                    <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                  </div>
                ),
                width: "50px",
              },
              ...columns,
            ]
          : columns
      );
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    pageOptions,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    selectedFlatRows,
    state: { pageIndex, pageSize, globalFilter, selectedRowIds },
  }: any = tableInstance;

  // Set the default value for the entries per page when component mounts
  useEffect(() => setPageSize(defaultValue || 10), [defaultValue]);
  // Set the entries per page value based on the select value
  const setEntriesPerPage = (value: any) => setPageSize(value);

  // Render the paginations
  const renderPagination = pageOptions.map((option: any) => (
    <MDPagination
      item
      key={option}
      onClick={() => gotoPage(Number(option))}
      active={pageIndex === option}
    >
      {option + 1}
    </MDPagination>
  ));

  // Handler for the input to set the pagination index
  const handleInputPagination = ({ target: { value } }: { target: { value: number } }) =>
    value > pageOptions.length || value < 0 ? gotoPage(0) : gotoPage(Number(value));

  // Customized page options starting from 1
  const customizedPageOptions = pageOptions.map((option: number) => option + 1);

  // Setting value for the pagination input
  const handleInputPaginationValue = ({ target: value }: { target: { value: number } }) =>
    gotoPage(Number(value.value - 1));

  // Search input value state
  const [search, setSearch] = useState(globalFilter || "");

  // Search input state handle
  const onSearchChange = (value: string) => {
    setSearch(value);
    if (!itemCount) {
      setGlobalFilter(validateTextField(value) || undefined);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      onSearchChange(searchValue);
    }, 1500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  // A function that sets the sorted value for the table
  const setSortedValue = (column: any) => {
    let sortedValue;

    if (isSorted && column.isSorted) {
      sortedValue = column.isSortedDesc ? "desc" : "asce";
    } else if (isSorted) {
      sortedValue = "none";
    } else {
      sortedValue = false;
    }

    return sortedValue;
  };

  // Setting the entries starting point
  const entriesStart = pageIndex === 0 ? pageIndex + 1 : pageIndex * pageSize + 1;

  // Setting the entries ending point
  let entriesEnd;

  if (pageIndex === 0) {
    entriesEnd = pageSize;
  } else if (pageIndex === pageOptions.length - 1) {
    entriesEnd = itemCount || rows.length;
  } else {
    entriesEnd = pageSize * (pageIndex + 1);
  }

  // @ts-ignore
  const usePrevious = (value, initialValue) => {
    const ref = useRef(initialValue);
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const useEffectDebugger = (
    effectHook: any,
    dependencies: any[],
    dependencyNames: string[] = []
  ) => {
    const previousDeps = usePrevious(dependencies, []);

    // @ts-ignore
    const changedDeps = dependencies.reduce((accum, dependency, index) => {
      if (dependency !== previousDeps[index]) {
        const keyName = dependencyNames[index] || index;
        return {
          ...accum,
          [keyName]: {
            before: previousDeps[index],
            after: dependency,
          },
        };
      }

      return accum;
    }, {});

    // eslint-disable-next-line consistent-return
    useEffect(
      () =>
        // eslint-disable-next-line no-prototype-builtins
        effectHook(changedDeps.hasOwnProperty("pageSize") || changedDeps.hasOwnProperty("search")),
      dependencies
    );
  };

  const loadData = async (isResetPage: boolean) => {
    showLoading(snackbarDispatch);
    setIsLoaded(false);
    const startTime = new Date().getTime();
    if (fetchData) {
      await fetchData({
        page: isResetPage ? 0 : pageIndex,
        size: pageSize,
        search: validateTextField(convertCharacterToHex(search)),
      });
    }
    const endTime = new Date().getTime();
    setTimeout(() => {
      setIsLoaded(true);
      hideLoading(snackbarDispatch);
    }, 500 - (endTime - startTime));
  };
  // eslint-disable-next-line consistent-return
  useEffectDebugger(
    // eslint-disable-next-line consistent-return
    async (isResetPage: boolean) => {
      if (fetchData && token) {
        if (isResetPage) {
          if (pageIndex !== 0) {
            gotoPage(0);
          } else {
            await loadData(isResetPage);
          }
        } else {
          setPageValue(pageIndex + 1);
          await loadData(isResetPage);
        }
      }
    },
    [search, pageSize, pageIndex, token, fetchData],
    ["search", "pageSize", "pageIndex", "token", "fetchData"]
  );

  useEffect(() => {
    if (rows?.length > 0 && customizedPageOptions[pageIndex] === undefined) {
      gotoPage(0);
    }
  }, [rows]);
  // set page close filter
  useEffect(() => {
    gotoPage(0);
  }, [fetchData]);

  // @ts-ignore
  useEffect(() => {
    if (fetchData && (rows.length <= pageSize - 1 || rows.length === pageSize + 1)) {
      fetchData({ page: pageIndex, size: pageSize, search });
    }
  }, [rows.length]);

  return (
    <>
      {entriesPerPage || canSearch ? (
        <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          {entriesPerPage && (
            <MDBox display="flex" alignItems="center">
              <Autocomplete
                disableClearable
                value={pageSize.toString()}
                options={entries}
                onChange={(event, newValue) => {
                  setEntriesPerPage(parseInt(newValue, 10));
                }}
                size="small"
                sx={{ width: "5rem" }}
                renderInput={(params) => <MDInput {...params} />}
                ListboxProps={{ style: { maxHeight: "15rem" } }}
              />
              <MDTypography variant="caption" color="secondary">
                &nbsp;&nbsp;entries per page
              </MDTypography>
            </MDBox>
          )}
          {canSearch && (
            <MDBox width="12rem" ml="auto">
              <MDInput
                placeholder="Tìm kiếm..."
                value={searchValue}
                size="small"
                fullWidth
                onChange={(e: any) => {
                  setSearchValue(e.target.value);
                }}
                inputProps={{ maxLength: MAX_LENGTH_STRING }}
                onKeyPress={(ev: any) => {
                  if (ev.key === "Enter") {
                    ev.preventDefault();
                    onSearchChange(ev.target.value);
                  }
                }}
              />
            </MDBox>
          )}
          {formFilter && formFilter(pageSize, search)}
        </MDBox>
      ) : null}
      <TableContainer sx={{ boxShadow: "none" }}>
        <Table {...getTableProps()}>
          <MDBox component="thead">
            {headerGroups.map((headerGroup: any, index: number) => (
              <TableRow {...headerGroup.getHeaderGroupProps()} key={`headerGroup_${index}`}>
                {headerGroup.headers.map((column: any, i: number) => (
                  <DataTableHeadCell
                    key={`header_${i}`}
                    {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                    width={column.width ? column.width : "auto"}
                    align={column.align ? column.align : "left"}
                    sorted={setSortedValue(column)}
                  >
                    {column.render("Header")}
                  </DataTableHeadCell>
                ))}
              </TableRow>
            ))}
          </MDBox>
          <TableBody {...getTableBodyProps()}>
            {page.map((row: any, key: number) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()} key={`row_${key}`}>
                  {row.cells.map((cell: any, i: number) => (
                    <DataTableBodyCell
                      key={`cell_${i}`}
                      noBorder={noEndBorder && rows.length - 1 === key}
                      align={cell.column.align ? cell.column.align : "left"}
                      {...cell.getCellProps()}
                    >
                      {cell.render("Cell")}
                    </DataTableBodyCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {isLoaded && page?.length === 0 && (
        <MDBox style={{ display: "flex", justifyContent: "center", paddingTop: "1.5em" }}>
          <MDTypography variant="button" color="secondary" fontWeight="regular">
            Không có dữ liệu
          </MDTypography>
        </MDBox>
      )}
      <MDBox
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        p={!showTotalEntries && pageOptions.length === 1 ? 0 : 3}
      >
        {showTotalEntries && page?.length > 0 && (
          <MDBox mb={{ xs: 3, sm: 0 }}>
            <MDTypography variant="button" color="secondary" fontWeight="regular">
              Showing {entriesStart} to {entriesEnd} of {itemCount || rows.length} entries
            </MDTypography>
          </MDBox>
        )}
        {pageOptions.length > 1 && (
          <MDPagination
            variant={pagination.variant ? pagination.variant : "gradient"}
            color={pagination.color ? pagination.color : "info"}
          >
            {canPreviousPage && (
              <MDPagination item onClick={() => previousPage()}>
                <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
              </MDPagination>
            )}
            {renderPagination.length > 6 ? (
              <MDBox width="5rem" mx={0.5}>
                <MDInput
                  value={pageValue}
                  onChange={(e: any) => {
                    setPageValue(e.target.value);
                  }}
                  onKeyPress={(ev: any) => {
                    if (ev.key === "Enter") {
                      ev.preventDefault();
                      if (
                        Number.isNaN(ev.target.value) ||
                        Number(ev.target.value) < 0 ||
                        ev.target.value.length !== Number(ev.target.value).toString().length
                      ) {
                        ev.target.value = 1;
                      } else if (Number(ev.target.value) > customizedPageOptions.length) {
                        ev.target.value = customizedPageOptions.length;
                      }
                      handleInputPagination(ev);
                      handleInputPaginationValue(ev);
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MDTypography variant="text" frontSize="11">
                          /{customizedPageOptions.length}
                        </MDTypography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root > input": {
                      paddingRight: 0,
                      textAlign: "right",
                    },
                  }}
                />
              </MDBox>
            ) : (
              renderPagination
            )}
            {canNextPage && (
              <MDPagination item onClick={() => nextPage()}>
                <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
              </MDPagination>
            )}
          </MDPagination>
        )}
      </MDBox>
    </>
  );
}

// Setting default values for the props of DataTable
DataTable.defaultProps = {
  entriesPerPage: { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  canSearch: false,
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "info" },
  isSorted: true,
  noEndBorder: false,
};

// Typechecking props for the DataTable
DataTable.propTypes = {
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
};

export default DataTable;
