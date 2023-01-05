import { Grid, Icon } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDInput from "components/bases/MDInput";
import { Employee } from "models/base/employee";
import { useEffect, useState } from "react";
import { AreaSettingReportType } from "types/areaSetingReport";
import EmployeeAutocomplete from "layouts/base/employees/components/EmployeeAutocomplete";

function ManagerTimeSkipItem({
  handleUpdateReport,
  position,
  item,
  totalNumber,
}: {
  handleUpdateReport: (index: number, newValue: AreaSettingReportType | null) => void;
  position: number;
  item: AreaSettingReportType;
  totalNumber: number;
}) {
  const [manager, setManager] = useState<Employee | null>(item.staff);
  const [time, setTime] = useState<number | null>(item.timeReport);
  const [seed, setSeed] = useState(0);

  const handleChangeTime = (e: any) => {
    setTime(e.target.value);
  };

  useEffect(() => {
    setTime(item.timeReport);
    setManager(item.staff);
  }, [item]);

  // Rerender
  useEffect(() => {
    setSeed(Math.random());
  }, [totalNumber]);

  useEffect(() => {
    if (time !== null) {
      handleUpdateReport(position, {
        staff: manager,
        timeReport: time,
      });
    }
  }, [manager, time]);
  const handleRemoveItem = () => {
    handleUpdateReport(position, null);
  };
  return (
    <Grid container mb={1} style={{ fontSize: "13px" }} key={`${position}_${seed}`} spacing={2}>
      <Grid item xs={6} md={6} lg={6} className="area-restriction-setting" style={{ height: "0" }}>
        <MDBox mb={1}>
          <EmployeeAutocomplete
            defaultData={manager ? Array.of(manager) : null}
            type="autocomplete"
            label="Nhân viên cảnh báo"
            handleChoose={(employees) => {
              if (employees.length > 0) {
                setManager(employees[0]);
              } else setManager(null);
            }}
            status="active"
            minWidth={0}
          />
        </MDBox>
      </Grid>
      <Grid item xs={6} md={6} lg={6} display="flex" alignSelf="center">
        <MDBox display="flex" alignSelf="center" paddingRight="0.5em">
          Sau{" "}
        </MDBox>
        <MDInput
          style={{ minWidth: "40px" }}
          value={time || undefined}
          onChange={(e: any) => handleChangeTime(e)}
        />
        <MDBox display="flex" alignSelf="center" paddingLeft="0.5em">
          {" "}
          phút
        </MDBox>
        <MDBox
          onClick={() => handleRemoveItem()}
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          fontSize="20px"
          paddingLeft="1em"
        >
          <Icon color="error" onClick={() => handleRemoveItem()} style={{ cursor: "pointer" }}>
            remove_circle
          </Icon>
        </MDBox>
      </Grid>
    </Grid>
  );
}

export default ManagerTimeSkipItem;
