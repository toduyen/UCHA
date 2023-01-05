import { useEffect, useRef, useState } from "react";

const useIsMainWindow = () => {
  const initialized = useRef(false);
  const isNewWindowPromotedToMain = useRef(false);
  const windowId = useRef(null);
  const [isMain, setIsMain] = useState<null | boolean>(null);

  const getWindowArray = () => {
    const storage = window.localStorage.getItem("checkTab");
    return storage ? JSON.parse(storage) : [];
  };

  const setWindowArray = (data: any) => {
    window.localStorage.setItem("checkTab", JSON.stringify(data));
  };

  const determineWindowState = () => {
    const windowArray = getWindowArray();

    if (initialized.current) {
      if (
        windowArray.length <= 1 ||
        (isNewWindowPromotedToMain.current
          ? windowArray[windowArray.length - 1]
          : windowArray[0]) === windowId.current
      ) {
        setIsMain(true);
      } else {
        setIsMain(false);
      }
    } else {
      if (windowArray.length === 0) {
        setIsMain(true);
      }
      const newWindowArray = [...windowArray, windowId.current];
      setWindowArray(newWindowArray);
    }

    setTimeout(() => {
      determineWindowState();
    }, 1500);
  };

  const removeWindow = () => {
    const newWindowArray = getWindowArray();
    for (let i = 0, { length } = newWindowArray; i < length; i++) {
      if (newWindowArray[i] === windowId.current) {
        newWindowArray.splice(i, 1);
        break;
      }
    }
    setWindowArray(newWindowArray);
  };

  useEffect(() => {
    window.addEventListener("beforeunload", removeWindow);
    window.addEventListener("unload", removeWindow);
    isNewWindowPromotedToMain.current = true;
    // @ts-ignore
    windowId.current = Date.now().toString();
    determineWindowState();
    initialized.current = true;

    return () => {
      window.removeEventListener("beforeunload", removeWindow);
      window.removeEventListener("unload", removeWindow);
    };
  }, []);

  return isMain;
};

export default useIsMainWindow;
