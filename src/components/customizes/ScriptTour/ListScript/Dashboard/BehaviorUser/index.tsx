import React from "react";
import FormatContent from "../../../FormatContent";

export default [
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__one"]',
    content: FormatContent({ contentMessage: `Danh sách tính năng` }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__two"]',
    content: FormatContent({ contentMessage: `Tổng hợp số liệu` }),
  },
  {
    stepInteraction: true,
    selector: '[data-tut="reactour__three"]',
    content: FormatContent({
      contentMessage: `Để mở danh sách các camera bạn có thể ấn vào biểu tượng này`,
    }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__four"]',
    content: FormatContent({ contentMessage: `Danh sách camera` }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__five"]',
    content: FormatContent({ contentMessage: `Chọn tất cả camera` }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__six"]',
    content: FormatContent({
      contentMessage: `Chọn một số camera`,
    }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__seven"]',
    content: FormatContent({
      contentMessage: `Lưu kết quả camera đã chọn`,
    }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__eight"]',
    content: FormatContent({
      contentMessage: `Hủy kết quả camera đã chọn`,
    }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__nine"]',
    content: FormatContent({ contentMessage: `Danh sách cảnh báo` }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__nine_one"]',
    content: FormatContent({ contentMessage: `Danh sách cảnh báo người lạ` }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__nine_two"]',
    content: FormatContent({ contentMessage: `Danh sách nhân viên` }),
  },
  {
    stepInteraction: false,
    selector: '[data-tut="reactour__end"]',
    content: FormatContent({
      contentMessage: `Cảm ơn bạn đã theo dõi hướng dẫn này. Thoát khỏi hưỡng dẫn hãy ấn nút " X " ở góc trên bên phải`,
    }),
    position: "center",
  },
];
