import { useCallback, useEffect, useState } from "react";
import { getAllEmployeesApi } from "../api";
import { Employee } from "models/base/employee";
import MDBox from "../../../../components/bases/MDBox";
import { CardMedia } from "@mui/material";
import { useAuthenController } from "../../../../context/authenContext";
import {
  getAllEmployeeSuccess,
  updateFilterEmployee,
  useEmployeeController,
} from "../../../../context/employeeContext";
import { isTimeKeepingModule } from "utils/checkRoles";
import { AreaEmployee } from "models/area-restriction/areaEmployee";
import { getTimeKeepingShiftApi } from "../../../time-keeping/setting/api";
import { getAllShiftSuccess, useShiftController } from "../../../../context/shiftContext";
import RowAction from "../../../../components/customizes/Tables/RowAction";
import { convertStatusToString, isValidEmail } from "utils/helpers";
import MDButton from "components/bases/MDButton";
import { AcionType } from "../../../../types/actionType";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import { STRING_SHORT_LENGTH } from "../../../../constants/app";
import { ManagerEmployeeType } from "../../../../types/managerEmployeeType";
import { EmployeeFilterType } from "../../../../types/filterType";

export default function data({
  handleView,
  handleEdit,
  handleDelete,
  handleViewImageDetails,
}: AcionType) {
  const [pageCount, setPageCount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [employeesDatas, setEmployeesData] = useState<Array<ManagerEmployeeType>>([]);

  // @ts-ignore
  const [authController] = useAuthenController();
  // @ts-ignore
  const [employeeController, employeeDispatch] = useEmployeeController();
  // @ts-ignore
  const [, shiftDispatch] = useShiftController();

  const [token, setToken] = useState(null);

  const [filter, setFilter] = useState<EmployeeFilterType>({
    status: "Đang hoạt động",
    manager: null,
    shifts: null,
    pageSize: 10,
    search: "",
  });

  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    setFilter(employeeController?.filter);
  }, [employeeController?.filter]);

  useEffect(
    () => () => {
      getAllEmployeeSuccess(employeeDispatch, []);
      updateFilterEmployee(employeeDispatch, {
        status: "Đang hoạt động",
        manager: null,
        shifts: null,
        pageSize: 10,
        search: "",
      });
    },
    []
  );

  useEffect(() => {
    if (token !== authController.token) {
      setToken(authController.token);
    }
  }, [authController.token]);

  const fetchData = useCallback(
    // eslint-disable-next-line no-shadow
    async ({ page, size, search }) => {
      setSearch(search);
      const status = filter?.status ? (filter?.status === "Đã xóa" ? "deleted" : "active") : "";
      const managerId = filter?.manager ? filter?.manager.id : undefined;
      const shiftIds = filter?.shifts ? filter?.shifts.map((item) => item.id).join(",") : undefined;
      if (token) {
        const getAllEmployeesResponse = await getAllEmployeesApi({
          token,
          page,
          size,
          search,
          status,
          managerId,
          shiftIds,
        });
        if (getAllEmployeesResponse.data !== null) {
          getAllEmployeeSuccess(employeeDispatch, getAllEmployeesResponse.data.data);
          setPageCount(getAllEmployeesResponse.data.pageCount);
          setItemCount(getAllEmployeesResponse.data.itemCount);
        }
      }
    },
    [token, filter]
  );

  const fetchShiftData = useCallback(async () => {
    if (token) {
      const getAllShiftResponse = await getTimeKeepingShiftApi(token);
      if (getAllShiftResponse.data !== null) {
        getAllShiftSuccess(shiftDispatch, getAllShiftResponse.data);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      if (isTimeKeepingModule()) {
        fetchShiftData().catch(console.error);
      }
    }
  }, [token]);

  const convertDataToRow = (employee: Employee) => {
    let temp = {
      id: employee.id,
      name: employee?.name,
      code: employee?.code,
      email: employee?.email,
      phone: employee.phone,
    };
    if (isTimeKeepingModule()) {
      temp = {
        ...temp,
        // @ts-ignore
        shifts: (
          <>
            {employee.shifts.map((shift) => (
              <MDBox
                borderRadius={20}
                px={1}
                my={1}
                style={{
                  backgroundColor: "#4F4F52",
                  color: "white",
                  fontSize: "0.875rem",
                }}
              >
                {shift.name}
              </MDBox>
            ))}
          </>
        ),
      };
    } else {
      temp = {
        ...temp,
        // @ts-ignore
        areaEmployees: (
          <>
            {employee.areaEmployees.map((item: AreaEmployee) => (
              <MDBox
                borderRadius={20}
                px={1}
                my={1}
                style={{
                  backgroundColor: "#4F4F52",
                  color: "white",
                  fontSize: "0.875rem",
                  display: "flex",
                }}
              >
                {convertEllipsisCharacter(item.areaRestriction.areaName, STRING_SHORT_LENGTH)}
                {`, ${item.timeStart}-${item.timeEnd}`}
              </MDBox>
            ))}
          </>
        ),
      };
    }
    temp = {
      ...temp,
      // @ts-ignore
      image:
        employee.image !== null ? (
          <MDButton onClick={() => handleViewImageDetails(employee)}>
            <CardMedia
              component="img"
              height="80"
              image={employee.image.path}
              alt={employee.name}
            />
          </MDButton>
        ) : (
          <div />
        ),
      status: convertStatusToString(employee.status),
      action:
        employee.status === "active" ? (
          <RowAction
            handleView={() => handleView(employee)}
            handleEdit={() => handleEdit(employee)}
            handleDelete={() => handleDelete(employee)}
          />
        ) : (
          <div />
        ),
    };
    return temp;
  };
  const getEmployeesDataOfManager = (employeeIsManager: Employee): Array<any> =>
    employeeIsManager.employees.map((employee: Employee) => convertDataToRow(employee));

  const convertDataToRowStep1 = (employeeIsManager: Employee) => {
    const rows = getEmployeesDataOfManager(employeeIsManager);
    return {
      manager: `${employeeIsManager.code}-${employeeIsManager.name}`,
      employees: rows,
      id: employeeIsManager.id,
    };
  };

  useEffect(() => {
    // Get all manager of employees
    const managers: Array<Employee> = [];
    const employeeNoManagers: Array<Employee> = [];
    employeeController.employees.forEach((item: Employee) => {
      const { manager } = item;
      if (manager === null) {
        employeeNoManagers.push(item);
      } else {
        const index = managers.findIndex((e: Employee) => e.id === manager.id);
        if (index === -1) {
          manager.employees = [item];
          managers.push(manager);
        } else {
          managers[index].employees.push(item);
        }
      }
    });

    const managersData = managers.map((employee: Employee) => convertDataToRowStep1(employee));
    const employeeNoManagersData = employeeNoManagers.map((employee: Employee) => ({
      manager: "",
      employees: [convertDataToRow(employee)],
      id: 0,
    }));

    const employeesData = employeeController.employees.map((employee: any) => ({
      manager: employee.manager ? `${employee.manager.code}-${employee.manager.name}` : "",
      employees: [convertDataToRow(employee)],
      id: employee.manager ? employee.manager.id : 0,
    }));
    if (isValidEmail(search)) {
      setEmployeesData(employeesData);
    } else {
      // @ts-ignore
      setEmployeesData(managersData.concat(employeeNoManagersData));
    }
  }, [employeeController.employees]);

  return {
    columns: [
      {
        Header: "Người quản lý",
        columns: [{ Header: "Mã Số-Họ và tên", accessor: "managerName", align: "center" }],
        align: "center",
      },
      {
        Header: "Nhân sự",
        columns: isTimeKeepingModule()
          ? [
              { Header: "Họ và tên", accessor: "name", align: "center" },
              { Header: "Mã số", accessor: "code", align: "center" },
              { Header: "Email", accessor: "email", align: "center" },
              { Header: "Số điện thoại", accessor: "phone", align: "center" },
              { Header: "Ca làm việc", accessor: "shifts", align: "center" },
              { Header: "Hình ảnh nhận diện", accessor: "image", align: "center" },
              { Header: "Trạng thái", accessor: "status", align: "center" },
              { Header: "Thao tác", accessor: "action", align: "left" },
            ]
          : [
              { Header: "Họ và tên", accessor: "name", align: "center" },
              { Header: "Mã số", accessor: "code", align: "center" },
              { Header: "Email", accessor: "email", align: "center" },
              { Header: "Số điện thoại", accessor: "phone", align: "center" },
              { Header: "Khu vực, thời gian cho phép", accessor: "areaEmployees", align: "center" },
              { Header: "Hình ảnh nhận diện", accessor: "image", align: "center" },
              { Header: "Trạng thái", accessor: "status", align: "center" },
              { Header: "Thao tác", accessor: "action", align: "left" },
            ],
        align: "center",
      },
    ],

    rows: employeesDatas,
    fetchData,
    pageCount,
    itemCount,
  };
}
