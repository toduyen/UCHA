import React, { forwardRef } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// Custom styles for MDInput
import MDInputRoot from "components/bases/MDInput/MDInputRoot";

const MDInput = forwardRef(({ error, success, disabled, hightlighterror, ...rest }: any, ref) => (
  <MDInputRoot
    {...rest}
    ref={ref}
    ownerState={{ error, success, disabled }}
    error={hightlighterror}
    disabled={disabled}
  />
));

// Setting default values for the props of MDInput
MDInput.defaultProps = {
  error: false,
  success: false,
  disabled: false,
};

// Typechecking props for the MDInput
MDInput.propTypes = {
  error: PropTypes.bool,
  success: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default MDInput;
