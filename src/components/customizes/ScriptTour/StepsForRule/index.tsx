import React from "react";

// eslint-disable-next-line no-undef,no-shadow
function StepsForRule(RuleCurrent: any, SetSteps: (step: any) => void, step?: any) {
  // @ts-ignore
  if (RuleCurrent) {
    SetSteps(step);
  }
}

export default StepsForRule;
