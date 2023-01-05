import React, { createContext, useContext, useMemo, useReducer } from "react";
import {
  ADD_IN_OUT_HISTORY_SUCCESS,
  GET_ALL_IN_OUT_HISTORIES_SUCCESS,
  UPDATE_EMPLOYEE_CHOOSED,
  UPDATE_FILTER_IN_OUT_HISTORY,
} from "constants/action";
import { InOutHistory } from "../models/base/inOutHistory";
import { Employee } from "models/base/employee";

// @ts-ignore
const InOutHistoryContext = createContext();
InOutHistoryContext.displayName = "InOutHistoryContext";

type InOutHistoryStateType = {
  inOutHistories: Array<InOutHistory>;
  filter: {
    employeeChoosed: Employee | null;
    pageSize: number;
  };
};

type InOutHistoryActionType = {
  type: string;
  payload: any;
};

const initialState: InOutHistoryStateType = {
  inOutHistories: [],
  filter: {
    employeeChoosed: null,
    pageSize: 10,
  },
};

const reducer = (state: InOutHistoryStateType, action: InOutHistoryActionType) => {
  switch (action.type) {
    case GET_ALL_IN_OUT_HISTORIES_SUCCESS: {
      return {
        ...state,
        inOutHistories: action.payload,
      };
    }
    case UPDATE_EMPLOYEE_CHOOSED: {
      return {
        ...state,
        employeeChoosed: action.payload,
      };
    }
    case UPDATE_FILTER_IN_OUT_HISTORY: {
      return {
        ...state,
        filter: action.payload,
      };
    }
    case ADD_IN_OUT_HISTORY_SUCCESS: {
      return {
        ...state,
        inOutHistories: [action.payload, ...state.inOutHistories],
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

function InOutHistoryProvider({ children }: { children: React.ReactElement }) {
  const [controller, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => [controller, dispatch], [controller, dispatch]);
  return <InOutHistoryContext.Provider value={value}>{children}</InOutHistoryContext.Provider>;
}

const useInOutHistoryController = () => {
  const context = useContext(InOutHistoryContext);

  if (!context) {
    throw new Error(
      "useInOutHistoryController should be used inside the InOutHistoryContextProvider."
    );
  }

  return context;
};

const getAllInOutHistoriesSuccess = (dispatch: any, inOutHistories: Array<InOutHistory>) =>
  dispatch({ type: GET_ALL_IN_OUT_HISTORIES_SUCCESS, payload: inOutHistories });

const updateEmployeeChoosed = (dispatch: any, employeeChoosed: any) =>
  dispatch({ type: UPDATE_EMPLOYEE_CHOOSED, payload: employeeChoosed });

const updateFilterInOutHistory = (dispatch: any, filter: any) =>
  dispatch({ type: UPDATE_FILTER_IN_OUT_HISTORY, payload: filter });

const addInOutHistorySuccess = (dispatch: any, inOutHistory: InOutHistory) =>
  dispatch({
    type: ADD_IN_OUT_HISTORY_SUCCESS,
    payload: inOutHistory,
  });
export {
  InOutHistoryProvider,
  useInOutHistoryController,
  getAllInOutHistoriesSuccess,
  updateEmployeeChoosed,
  updateFilterInOutHistory,
  addInOutHistorySuccess,
};
