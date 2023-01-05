import React from "react";

// eslint-disable-next-line no-undef
function JumpCondition(
  currStep: number,
  numberStep: number,
  varBoolean: boolean,
  numberJump: number,
  // eslint-disable-next-line no-shadow
  setCurrentStep: (numberJump: number) => void
) {
  // eslint-disable-next-line consistent-return
  switch (currStep) {
    case numberStep:
      if (!varBoolean) {
        setCurrentStep(numberJump);
      }
      break;
    default:
      break;
  }
}

export default JumpCondition;
