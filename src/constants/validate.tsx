const USERNAME_EMPTY_ERROR = "Tên người dùng không được để trống";
const FULLNAME_EMPTY_ERROR = "Họ và tên không được để trống";
const USERNAME_INVALID_ERROR =
  "Tên người dùng phải có ít nhất 5 ký tự, không chứa ký tự đặc biệt, dấu cách";
const PASSWORD_EMPTY_ERROR = "Mật khẩu để trống";
const NEW_PASSWORD_EMPTY_ERROR = "Mật khẩu mới để trống";
const PASSWORD_INVALID_ERROR =
  "Mật khẩu không hợp lệ, phải chứa ít nhất 8 ký tự trong đó có ít nhất 1 chữ in thường, 1 chữ in hoa, 1 số và 1 ký tự đặc biệt";
const NEW_PASSWORD_INVALID_ERROR =
  "Mật khẩu mới không hợp lệ, phải chứa ít nhất 8 ký tự trong đó có ít nhất 1 chữ in thường, 1 chữ in hoa, 1 số và 1 ký tự đặc biệt";
const CONFIRM_PASSWORD_EMPTY_ERROR = "Mật khẩu lặp lại để trống";
const CONFIRM_PASSWORD_NOT_MATCH_ERROR = "Mật khẩu và Mật khẩu lặp lại không khớp";
const USER_ROLE_EMPTY_ERROR = "Người dùng phải có ít nhất một vai trò";
const CREATE_USER_ERROR = "Thêm người dùng thất bại";
const CREATE_USER_SUCCESS =
  "Thêm người dùng thành công, kiểm tra link thay đổi mật khẩu trong mail";
const EMAIL_EMPTY_ERROR = "Email không được để trống";
const EMAIL_INVALID_ERROR = "Email không hợp lệ";
const SEND_EMAIL_SUCCESS = "Kiểm tra email để đặt lại mật khẩu";

const ORGANIZATION_EMPTY_ERROR = "Tổ chức không được để trống";
const CREATE_ORGANIZATION_SUCCESS = "Thêm tổ chức thành công";
const CREATE_ORGANIZATION_ERROR = "Thêm tổ chức thất bại";
const PHONE_INVALID_ERROR = "Số điện thoại không hợp lệ";
const CODE_INVALID_ERROR = "Mã nhân viên không đúng định dạng";
const CODE_EMPLOYEE_EMPTY_ERROR = "Mã số nhân viên không được để trống";
const SHIFT_EMPTY_ERROR = "Ca làm việc không được để trống";

const CREATE_LOCATION_SUCCESS = "Thêm mới chi nhánh thành công";
const LOCATION_EMPTY_ERROR = "Chi nhánh không được để trống";
const CODE_EMPTY_ERROR = "Mã chi nhánh không được để trống";
const CREATE_CAMERA_SUCCESS = "Thêm mới camera thành công";
const CAMERA_EMPTY_ERROR = "Camera không được để trống";
const IP_CAMERA_EMPTY_ERROR = "IP camera không được để trống";
const TYPE_CAMERA_EMPTY_ERROR = "Check in/ Check out không được để trống";

const NAME_AREA_EMPTY_ERROR = "Tên khu vực không được để trống";
const NAME_CODE_EMPTY_ERROR = "Mã khu vực không được để trống";
const PERSONNEL_IN_CHARGE_EMPTY_ERROR = "Người phụ trách khu vực không được để trống";
const CREATE_AREA_RESTRICTION_SUCCESS = "Thêm mới khu vực hạn chế thành công";
const PHONE_EMPTY_ERROR = "Số điện thoại không được để trống";

const SHARE_QR_CODE_SUCCESS = "Chia sẻ qr code tới mail của các nhân viên thành công";
const AVATAR_EMPTY_ERROR = "Avatar không được bỏ trống";
const TIME_IS_REQUIRE = "Thời gian là bắt buộc";

const ORGANIZATION_ALREADY_EXISTS = "Tổ chức đã tồn tại";
const NAME_ORGANIZATION_ALREADY_EXISTS = "Tên tổ chức đã tồn tại";
const TIME_IS_NOT_VALID = "Thời gian không hợp lệ.";
const TIME_START_IS_NOT_VALID = "Thời gian bắt đầu không hợp lệ.";
const TIME_END_IS_NOT_VALID = "Thời gian kết thúc không hợp lệ.";
const TIME_START_BIGGER_TIME_END = "Thời gian bắt đầu lớn hơn thời gian kết thúc.";
const TIME_END_SMALLER_TIME_START = "Thời gian kết thúc nhỏ hơn thời gian  bắt đầu.";
const USER_NAME_EMPTY_ERROR = "Tên đăng nhập không được để trống";
const FULL_NAME_IS_NOT_VALID = "Họ và tên chứa ký tự đặc biệt";

const LOCATION_CODE_IS_NOT_VALID = "Mã chi nhánh không đúng định dạng.";
const AREA_CODE_IS_NOT_VALID = "Mã khu vực không đúng định dạng.";
const TIME_IS_BIGGER_THAN_TIME_CURRENT = "Thời gian lớn hơn thời gian hiện tại";
const DESCRIPTION_MAX_LENGTH = "Nhập quá 500 ký tự cho phép";
const CHAR_MAX_LENGTH = "Nhập quá 255 ký tự cho phép";

const LATE_TIME_MAX_LENGTH = "Thời gian cho phép đi muộn nhập quá ký tự";
const LATE_IN_WEEK_MAX_LENGTH = "Lần nhắc nhở theo tuần nhập quá ký tự";
const LATE_IN_MONTH_MAX_LENGTH = "Lần nhắc nhở theo tháng nhập quá ký tự";
const LATE_IN_QUARTER_MAX_LENGTH = "Lần nhắc nhở theo quý nhập quá ký tự";
const THE_TIME_ALLOWED = "Thời gian phải lớn hơn 0 và nhỏ hơn 999";
const EMPLOYEE_IS_EMPTY = "Trường nhân viên không được để trống";
const TIME_IS_EMPTY = "Trường thời gian không được để trống";

export {
  USERNAME_EMPTY_ERROR,
  USERNAME_INVALID_ERROR,
  PASSWORD_EMPTY_ERROR,
  NEW_PASSWORD_EMPTY_ERROR,
  PASSWORD_INVALID_ERROR,
  NEW_PASSWORD_INVALID_ERROR,
  CONFIRM_PASSWORD_EMPTY_ERROR,
  CONFIRM_PASSWORD_NOT_MATCH_ERROR,
  USER_ROLE_EMPTY_ERROR,
  CREATE_USER_ERROR,
  CREATE_USER_SUCCESS,
  EMAIL_EMPTY_ERROR,
  EMAIL_INVALID_ERROR,
  SEND_EMAIL_SUCCESS,
  ORGANIZATION_EMPTY_ERROR,
  CREATE_ORGANIZATION_SUCCESS,
  CREATE_ORGANIZATION_ERROR,
  PHONE_INVALID_ERROR,
  FULLNAME_EMPTY_ERROR,
  CODE_EMPTY_ERROR,
  SHIFT_EMPTY_ERROR,
  CREATE_LOCATION_SUCCESS,
  LOCATION_EMPTY_ERROR,
  CODE_EMPLOYEE_EMPTY_ERROR,
  CODE_INVALID_ERROR,
  CREATE_CAMERA_SUCCESS,
  CAMERA_EMPTY_ERROR,
  IP_CAMERA_EMPTY_ERROR,
  NAME_AREA_EMPTY_ERROR,
  NAME_CODE_EMPTY_ERROR,
  PERSONNEL_IN_CHARGE_EMPTY_ERROR,
  CREATE_AREA_RESTRICTION_SUCCESS,
  PHONE_EMPTY_ERROR,
  TYPE_CAMERA_EMPTY_ERROR,
  SHARE_QR_CODE_SUCCESS,
  AVATAR_EMPTY_ERROR,
  TIME_IS_REQUIRE,
  ORGANIZATION_ALREADY_EXISTS,
  NAME_ORGANIZATION_ALREADY_EXISTS,
  TIME_IS_NOT_VALID,
  TIME_START_BIGGER_TIME_END,
  TIME_END_SMALLER_TIME_START,
  USER_NAME_EMPTY_ERROR,
  FULL_NAME_IS_NOT_VALID,
  LOCATION_CODE_IS_NOT_VALID,
  TIME_IS_BIGGER_THAN_TIME_CURRENT,
  THE_TIME_ALLOWED,
  AREA_CODE_IS_NOT_VALID,
  TIME_START_IS_NOT_VALID,
  TIME_END_IS_NOT_VALID,
  DESCRIPTION_MAX_LENGTH,
  EMPLOYEE_IS_EMPTY,
  TIME_IS_EMPTY,
  LATE_TIME_MAX_LENGTH,
  LATE_IN_WEEK_MAX_LENGTH,
  LATE_IN_MONTH_MAX_LENGTH,
  LATE_IN_QUARTER_MAX_LENGTH,
  CHAR_MAX_LENGTH,
};
