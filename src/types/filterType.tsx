import { Employee } from "../models/base/employee";
import { Shift } from "../models/time-keeping/shift";

export type EmployeeFilterType = {
  status: string | null;
  manager: Employee | null;
  shifts?: Array<Shift> | null;
  pageSize: number;
  search: string;
};
