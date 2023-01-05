import FormatContent from "../../../FormatContent";

export default [
  {
    stepInteraction: false,
    selector: '[data-inout-history="InOutHistory__step1"]',
    content: FormatContent({ contentMessage: `Lọc danh sách nhân viên` }),
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
