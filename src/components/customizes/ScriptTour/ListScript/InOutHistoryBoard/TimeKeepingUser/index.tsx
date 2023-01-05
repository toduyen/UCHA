import FormatContent from "../../../FormatContent";

export default [
  {
    stepInteraction: false,
    selector: '[data-inout-history-board="InOutHistory__step1"]',
    content: FormatContent({ contentMessage: `Danh sách nhân viên chấm công` }),
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
