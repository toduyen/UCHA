import React, {createContext, useContext, useMemo, useReducer} from "react";
import {GET_ALL_LOG_SUCCESS, UPDATE_FILTER_USER_LOG} from "constants/action";
import {UserLog} from "models/base/userLog";
import {User} from "models/base/user";

// @ts-ignore
const UserLogContext = createContext();
UserLogContext.displayName = "UserLogContext";

type UserLogStateType = {
  userLogs: Array<UserLog>;
  filter: {
    accountChoosed: User | null;
    pageSize: number;
    search: string;
  };
};

type UserLogActionType = {
  type: string;
  payload: any;
};

const initialState: UserLogStateType = {
  userLogs: [],
  filter: {
    accountChoosed: null,
    pageSize: 10,
    search: "",
  },
};

const reducer = (state: UserLogStateType, action: UserLogActionType) => {
  switch (action.type) {
    case GET_ALL_LOG_SUCCESS: {
      return {
        ...state,
        userLogs: action.payload,
      };
    }
    case UPDATE_FILTER_USER_LOG: {
      return {
        ...state,
        filter: action.payload,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

function UserLogProvider({ children }: { children: React.ReactElement }) {
  const [controller, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => [controller, dispatch], [controller, dispatch]);
  return <UserLogContext.Provider value={value}>{children}</UserLogContext.Provider>;
}

const useUserLogController = () => {
  const context = useContext(UserLogContext);

  if (!context) {
    throw new Error("useUserLogController should be used inside the UserLogContextProvider.");
  }

  return context;
};

const getAllUserLogResponseSuccess = (dispatch: any, log: Array<UserLog>) =>
  dispatch({ type: GET_ALL_LOG_SUCCESS, payload: log });

const updateFilterUserLog = (dispatch: any, filter: any) =>
  dispatch({ type: UPDATE_FILTER_USER_LOG, payload: filter });

export { UserLogProvider, useUserLogController, getAllUserLogResponseSuccess, updateFilterUserLog };
