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
    stepInteraction: false,
    selector: '[data-tut="reactour__end"]',
    content: FormatContent({
      contentMessage: `Cảm ơn bạn đã theo dõi hướng dẫn này. Thoát khỏi hưỡng dẫn hãy ấn nút " X " ở góc trên bên phải`,
    }),
    position: "center",
  },
];
