import React, { useEffect } from "react";
import { TourProvider } from "@reactour/tour";
import {
  CAMERA_LIST_ROUTE,
  DASHBOARD_ROUTE,
  HISTORY_LIST_ROUTE,
} from "../../../../constants/route";
import { useLocation } from "react-router-dom";
import MDBox from "../../../bases/MDBox";
import { Getter } from "../StateTour/Getter";

type Props = {
  children?: React.ReactElement;
};

// eslint-disable-next-line no-undef
function ProviderStep({ children }: Props) {
  const { pathname } = useLocation();
  // @ts-ignore
  const hidden = () => {
    document.body.style.overflow = "hidden";
  };
  const show = () => {
    document.body.style.overflow = "auto";
  };
  useEffect(() => {
    if (pathname === DASHBOARD_ROUTE) {
      hidden();
    } else {
      show();
    }
  }, [pathname]);

  const elementProviderStep = () => (
    <TourProvider
      steps={[]}
      afterOpen={() => hidden()}
      beforeClose={() => hidden()}
      showBadge={false}
      disableDotsNavigation={true}
      showDots={true}
      styles={{
        popover: (base: { [p: string]: any }) => ({
          ...base,
          borderRadius: "12px",
          padding: "1.6em",
        }),
      }}
      disableInteraction
      onClickHighlighted={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        e.stopPropagation();
      }}
      onClickMask={() => {}}
    >
      {children}
    </TourProvider>
  );
  // eslint-disable-next-line react/jsx-no-useless-fragment
  const elementRoot = () => <MDBox>{children}</MDBox>;

  // eslint-disable-next-line consistent-return
  const renderTour = () => {
    switch (pathname) {
      case DASHBOARD_ROUTE:
        if (Getter()?.STATUS_DASHBOARD === false) {
          return elementRoot();
        }
        return elementProviderStep();
        // eslint-disable-next-line no-unreachable
        break;
      case CAMERA_LIST_ROUTE:
        if (Getter()?.STATUS_CAMERA === false) {
          return elementRoot();
        }
        return elementProviderStep();
        // eslint-disable-next-line no-unreachable
        break;
      case HISTORY_LIST_ROUTE:
        if (Getter()?.STATUS_IN_OUT_HISTORY === false) {
          return elementRoot();
        }
        return elementProviderStep();
        // eslint-disable-next-line no-unreachable
        break;
      default:
        return elementProviderStep();
    }
  };

  return renderTour();
}

export default ProviderStep;
