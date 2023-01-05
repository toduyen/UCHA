import React from "react";
import FormatContent from "../../../FormatContent";
import MDBox from "../../../../../bases/MDBox";
import { CardMedia, Grid } from "@mui/material";
import { VIDEO_TOUR_STEP_3 } from "../../../../../../constants/app";
import "./StyleContent.css";

export default [
  {
    stepInteraction: false,
    selector: '[data-tut="setting__camera1"]',
    content: () => (
      <MDBox>
        <div className="box__title">{FormatContent({ contentMessage: `Danh sách phím tắt` })}</div>
        <p className="box__comment">
          ( Các phím tắt được kích hoạt sau khi bạn vẽ xong vùng hạn chế )
        </p>
        <Grid container>
          <Grid item xs={4} md={4} lg={4} xl={4} alignSelf="center">
            <div id="main">
              <div className="k78 key">
                <div className="keycap">N</div>
              </div>
            </div>
          </Grid>
          <Grid item xs={8} md={8} lg={8} xl={8} alignSelf="center">
            <p className="box__content">Chuyển tiếp khu vực</p>
          </Grid>
          <Grid item xs={4} md={4} lg={4} xl={4} alignSelf="center">
            <div id="main">
              <div className="k78 key">
                <div className="keycap">P</div>
              </div>
            </div>
          </Grid>
          <Grid item xs={8} md={8} lg={8} xl={8} alignSelf="center">
            <p className="box__content">Quay lại khu vực</p>
          </Grid>
          <Grid item xs={4} md={4} lg={4} xl={4} alignSelf="center">
            <div id="main">
              <div className="k78 key key2">
                <div className="keycap keycap2">Delete</div>
              </div>
            </div>
          </Grid>
          <Grid item xs={8} md={8} lg={8} xl={8} alignSelf="center">
            <p className="box__content">Xóa khu vực</p>
          </Grid>
        </Grid>
      </MDBox>
    ),
    position: "left",
  },
  {
    stepInteraction: false,
    selector: '[data-tut="setting__camera2"]',
    content: () => (
      <MDBox>
        <div className="box__title">{FormatContent({ contentMessage: `Các mẫu mặc định` })}</div>
        <p className="box__comment">( Để sử dụng được hãy Click vào từng mẫu )</p>
      </MDBox>
    ),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="setting__camera3"]',
    content: () => (
      <MDBox>
        <div className="box__title">
          {FormatContent({ contentMessage: `Vẽ tự do các vùng hạn chế` })}
        </div>
        <p className="box__comment">( Hãy theo dõi video ở dưới để học cách sử dụng )</p>
        <MDBox display="flex" alignSelf="center">
          <CardMedia component="video" height="188" image={VIDEO_TOUR_STEP_3} autoPlay />
        </MDBox>
      </MDBox>
    ),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="setting__camera4"]',
    content: FormatContent({ contentMessage: `Camera khu vực` }),
  },
];
