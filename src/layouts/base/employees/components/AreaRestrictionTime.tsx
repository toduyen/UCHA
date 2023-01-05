import { Grid, Icon, Popper } from "@mui/material";
import MDBox from "components/bases/MDBox";
import MDTimePicker from "components/bases/MDTimePicker";
import { useEffect, useState } from "react";
import { AreaEmployeeTimeType } from "types/areaEmployeeTimeType";
import AreaRestrictionAutocomplete from "../../../area-restriction/areaRestriction/components/AreaRestrictionAutocomplete";
import { AreaRestriction } from "../../../../models/area-restriction/areaRestriction";
import {
  EMPLOYEE_IS_EMPTY,
  TIME_IS_EMPTY,
  TIME_IS_NOT_VALID,
} from "../../../../constants/validate";

const styles = () => ({
  popper: {
    width: "fit-content",
  },
});
const PopperMy = function (props: any) {
  // @ts-ignore
  return <Popper {...props} style={styles.popper} placement="bottom-start" />;
};

export default function AreaRestrictionTime({
  areaRestrictionTime,
  position,
  handleUpdate,
  showError,
}: {
  areaRestrictionTime: AreaEmployeeTimeType;
  position: number;
  handleUpdate: (index: number, newValue: AreaEmployeeTimeType | null) => void;
  showError: boolean;
}) {
  const [timeStart, setTimeStart] = useState<Date | null>(areaRestrictionTime.timeStart);
  const [timeEnd, setTimeEnd] = useState<Date | null>(areaRestrictionTime.timeEnd);
  const [areaRestriction, setAreaRestriction] = useState<AreaRestriction | null>(
    areaRestrictionTime.areaRestriction
  );

  const [timeStartError, setTimeStartError] = useState("");
  const [timeEndError, setTimeEndError] = useState("");
  const [areaRestrictionError, setAreaRestrictionError] = useState("");
  const [showErrorState, setShowErrorState] = useState(false);
  const [checkTimeStart, setCheckTimeStart] = useState<boolean>(false);
  const [checkTimeEnd, setCheckTimeEnd] = useState<boolean>(false);

  useEffect(() => {
    setTimeStart(areaRestrictionTime.timeStart);
    setTimeEnd(areaRestrictionTime.timeEnd);
    setAreaRestriction(areaRestrictionTime.areaRestriction);
    if (areaRestrictionTime.areaRestriction === null) {
      setAreaRestrictionError(EMPLOYEE_IS_EMPTY);
    } else setAreaRestrictionError("");
    if (areaRestrictionTime.timeStart === null) {
      if (checkTimeStart) {
        setTimeStartError(TIME_IS_NOT_VALID);
      } else setTimeStartError(TIME_IS_EMPTY);
    } else setTimeStartError("");
    if (areaRestrictionTime.timeEnd === null) {
      if (checkTimeEnd) {
        setTimeEndError(TIME_IS_NOT_VALID);
      } else setTimeEndError(TIME_IS_EMPTY);
    } else setTimeEndError("");
  }, [areaRestrictionTime]);

  useEffect(() => {
    if (!areaRestrictionTime.isInit) {
      setShowErrorState(true);
    }
  }, [showError]);

  useEffect(() => {
    handleUpdate(position, {
      areaRestriction,
      timeStart,
      timeEnd,
      isInit: false,
    });
  }, [timeStart, timeEnd, areaRestriction]);

  const handleChangeStartTime = (time: Date | null) => {
    setShowErrorState(false);
    setTimeStartError("");
    if (time === null) {
      setTimeStartError(TIME_IS_EMPTY);
      setCheckTimeStart(false);
    } else if (time.toLocaleString() === "Invalid Date") {
      setTimeStartError(TIME_IS_NOT_VALID);
      setCheckTimeStart(true);
      time = null;
    }
    setTimeStart(time);
  };

  const handleChangeEndTime = (time: Date | null) => {
    setShowErrorState(false);
    setTimeEndError("");
    if (time === null) {
      setTimeEndError(TIME_IS_EMPTY);
      setCheckTimeEnd(false);
    } else if (time.toLocaleString() === "Invalid Date") {
      setTimeEndError(TIME_IS_NOT_VALID);
      setCheckTimeEnd(true);
      time = null;
    }
    setTimeEnd(time);
  };

  const handleRemoveItem = () => {
    handleUpdate(position, null);
  };

  return (
    <MDBox
      key={
        areaRestrictionTime.areaRestriction
          ? areaRestrictionTime.areaRestriction.areaName + position
          : position
      }
    >
      <Grid container spacing={1} className="area-restriction-time" style={{ marginBottom: "8px" }}>
        <Grid item xs={4} md={4} lg={4} style={{ height: "0" }}>
          <AreaRestrictionAutocomplete
            PopperComponent={PopperMy}
            minWidth={0}
            wrapperTextFieldClassName="area-restriction-autocomplete"
            label="Khu vực"
            type="autocomplete"
            defaultData={areaRestriction ? Array.of(areaRestriction) : []}
            handleChoose={(areaRestrictions) => {
              setShowErrorState(false);
              if (areaRestrictions.length > 0) {
                setAreaRestriction(areaRestrictions[0]);
              } else setAreaRestriction(null);
            }}
            error={showErrorState ? areaRestrictionError : ""}
          />
        </Grid>
        <Grid item xs={3.5} md={3.5} lg={3.5}>
          <MDTimePicker
            label="Bắt đầu"
            time={timeStart}
            handleChooseTime={(time: any) => handleChangeStartTime(time)}
            error={showErrorState ? timeStartError : ""}
          />
        </Grid>
        <Grid item xs={3.5} md={3.5} lg={3.5}>
          <MDTimePicker
            label="Kết thúc"
            time={timeEnd}
            handleChooseTime={(time: any) => handleChangeEndTime(time)}
            error={showErrorState ? timeEndError : ""}
          />
        </Grid>
        <Grid item xs={1} md={1} lg={1}>
          <MDBox
            onClick={() => handleRemoveItem()}
            height="100%"
            display="flex"
            alignItems="center"
          >
            <Icon color="error">remove_circle</Icon>
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}
