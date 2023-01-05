import SimpleBlogCard from "../../../../components/customizes/Cards/SimpleBlogCard";
import MDBox from "../../../../components/bases/MDBox";
import { CircularProgress, Grid } from "@mui/material";
import { setLayout, useMaterialUIController } from "../../../../context/materialContext";
import React, { useCallback, useEffect, useState } from "react";
import MDTypography from "../../../../components/bases/MDTypography";

import { w3cwebsocket as W3CWebSocket } from "websocket";
import { WEB_SOCKET_IN_OUT_URL } from "../../../../constants/api";
import { InOutHistory } from "../../../../models/base/inOutHistory";
import { getAllInOutHistoryApi } from "../api";
import {
  convertStringFromDateTime,
  convertStringTime,
  convertTimeStringToDate,
} from "../../../../utils/helpers";
import { useAuthenController } from "../../../../context/authenContext";
import InfiniteScroll from "react-infinite-scroll-component";
import ReconnectingWebSocket from "reconnecting-websocket";
import Icon from "@mui/material/Icon";
import MDButton from "../../../../components/bases/MDButton";
import pxToRem from "../../../../assets/theme/functions/pxToRem";
import { IN_OUT_TABLE_TITLE } from "../../../../constants/app";

type InOutHistoryItem = {
  locationId: number;
  employeeName: string;
  time: string;
  image: string;
};

export default function InOutHistoryBoard(
  actionCloseModal: Function,
  statusOpenModal: boolean,
  titleModal: string
) {
  // @ts-ignore
  const [materialController, materialDispatch] = useMaterialUIController();
  // @ts-ignore
  const [authController] = useAuthenController();

  const [inOutHistories, setInOutHistories] = useState<Array<InOutHistoryItem>>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [totalItem, setTotalItem] = useState<number>(0);

  useEffect(() => {
    setLayout(materialDispatch, "");
  }, []);

  const [token, setToken] = useState(null);

  useEffect(() => {
    if (token !== authController.token) {
      setToken(authController.token);
    }
  }, [authController.token]);

  const fetchData = useCallback(
    async ({ page, size }: { page: number; size: number }) => {
      if (token) {
        const getInOutHistoriesInCurrentDay = await getAllInOutHistoryApi({
          token,
          page,
          size,
          // @ts-ignore
          timeStart:
            titleModal === IN_OUT_TABLE_TITLE &&
            convertStringFromDateTime(convertTimeStringToDate("00:00:00")),
          // @ts-ignore
          timeEnd:
            titleModal === IN_OUT_TABLE_TITLE &&
            convertStringFromDateTime(convertTimeStringToDate("23:59:59")),
        });
        if (getInOutHistoriesInCurrentDay.data !== null) {
          setTotalItem(getInOutHistoriesInCurrentDay.data.itemCount);
          setTotalPage(getInOutHistoriesInCurrentDay.data.pageCount);
          setInOutHistories((prevState) => [
            ...prevState,
            ...getInOutHistoriesInCurrentDay.data.data.map((item: InOutHistory) => ({
              locationId: authController.currentUser.location.id,
              employeeName: item.employee.name,
              image: item.image ? item.image.path : "",
              time: convertStringTime(item.time),
            })),
          ]);
        }
      }
    },
    [token]
  );

  // @ts-ignore
  useEffect(async () => {
    if (token) {
      await fetchData({ page: 0, size: 20 });
    }
  }, [token]);

  // @ts-ignore
  useEffect(() => {
    let client: ReconnectingWebSocket | null = null;
    if (token) {
      client = WEB_SOCKET_IN_OUT_URL
        ? new ReconnectingWebSocket(WEB_SOCKET_IN_OUT_URL, [], {
            WebSocket: W3CWebSocket,
            connectionTimeout: 1000,
            maxRetries: 100,
          })
        : null;

      const { location } = authController.currentUser;
      if (client) {
        client.onopen = () => {
          console.log("WebSocket Time Keeping Connected");
        };
        client.onmessage = (message) => {
          if (typeof message.data === "string") {
            const jsonData = JSON.parse(message.data);
            if (jsonData.locationId === location.id) {
              setInOutHistories((prevState) =>
                [jsonData, ...prevState].slice(0, Math.max([jsonData, ...prevState].length - 1, 20))
              );
            }
          }
        };
      }
    }

    return () => {
      if (client) {
        console.log("WebSocket Time Keeping Disconnect");
        client.close();
      }
    };
  }, [token]);

  return (
    <MDBox
      bgColor="white"
      // @ts-ignore
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 3,
        position: "relative",
        height: "100%",
        [breakpoints.up("xl")]: {
          transition: transitions.create(["margin-left", "margin-right"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      <MDBox mt={3}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          textAlign="center"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{
            position: "fixed",
            top: 24,
            left: 16,
            right: 16,
            height: 75,
          }}
        >
          <div />
          <MDTypography variant="h4" fontWeight="medium" color="white">
            {titleModal}
          </MDTypography>
          <MDButton variant="text" color="white" onClick={() => actionCloseModal()}>
            <Icon>zoom_in_map</Icon>&nbsp;
          </MDButton>
        </MDBox>
        <div
          id="timeKeepingScroll"
          style={{
            height: `calc(100vh - ${pxToRem(100)})`,
            overflowY: "auto",
            overflowX: "hidden",
            position: "fixed",
            bottom: 0,
            left: 16,
            right: 16,
          }}
        >
          <InfiniteScroll
            dataLength={inOutHistories.length}
            next={async () => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              await fetchData({ page: newPage, size: 20 });
            }}
            hasMore={inOutHistories.length > 0 && currentPage <= Math.abs(totalPage - 1)}
            loader={
              totalItem <= 20 ? null : (
                <MDBox style={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress color="info" />
                </MDBox>
              )
            }
            scrollableTarget="timeKeepingScroll"
            style={{ overflow: "unset" }}
          >
            <Grid container spacing={3} mt={3}>
              {inOutHistories.map((item: InOutHistoryItem) => (
                <Grid item xs={12} md={4} lg={3}>
                  <MDBox mb={3}>
                    <SimpleBlogCard
                      image={item.image}
                      title={item.employeeName}
                      description={`Thời gian: ${item.time}`}
                      imageWidth={90}
                    />
                  </MDBox>
                </Grid>
              ))}
            </Grid>
          </InfiniteScroll>
        </div>
      </MDBox>
    </MDBox>
  );
}
