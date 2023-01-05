// eslint-disable-next-line prefer-regex-literals
export const detectWhiteSpaceStart: string | RegExp = new RegExp(/^\s+/g);
// eslint-disable-next-line prefer-regex-literals
export const detectWhiteSpaceEnd: string | RegExp = new RegExp(/\s+[ \t]+$/gm);
// eslint-disable-next-line prefer-regex-literals
export const detectWhiteSpaceAll: string | RegExp = new RegExp(/^\s+|\s+$|\s+(?=\s)/g);
// eslint-disable-next-line prefer-regex-literals
export const detectWhiteSpaceBeetween: string | RegExp = new RegExp(/\s{1,}/g);
// Explain: do not allow entering special characters in the name
// eslint-disable-next-line prefer-regex-literals
export const validUserRegex: string | RegExp = new RegExp(
  /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ \d]+$/
);
// Explain: detect special characters in code fields
// eslint-disable-next-line prefer-regex-literals
export const detectSpecialCharacterInCodeFields: string | RegExp = new RegExp(/^[a-zA-Z\d]+$/);
