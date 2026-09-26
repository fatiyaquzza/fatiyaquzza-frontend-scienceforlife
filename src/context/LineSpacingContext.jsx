import { createContext, useContext, useEffect, useState } from "react";
import { readStore, writeStore } from "../utils/safeStorage";

const STORAGE_KEY = "ilmana-line-spacing";
const DEFAULT_LINE_SPACING = "1.5";

export const LINE_SPACING_OPTIONS = [
  { value: "1", label: "Rapat (1.0×)" },
  { value: "1.5", label: "Normal (1.5×)" },
  { value: "1.8", label: "Longgar (1.8×)" },
  { value: "2", label: "Ganda (2.0×)" },
];

const LineSpacingContext = createContext(null);

export const LineSpacingProvider = ({ children }) => {
  // Provider ini membungkus seluruh aplikasi, jadi localStorage yang melempar
  // di sini membuat provider gagal mount dan seluruh aplikasi jadi layar putih.
  // Karena itu penulisan memakai helper yang menelan exception.
  const [lineSpacing, setLineSpacingState] = useState(
    () => readStore(STORAGE_KEY) || DEFAULT_LINE_SPACING
  );

  const setLineSpacing = (value) => {
    setLineSpacingState(value);
    writeStore(STORAGE_KEY, value);
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--content-line-height",
      lineSpacing
    );
  }, [lineSpacing]);

  return (
    <LineSpacingContext.Provider value={{ lineSpacing, setLineSpacing }}>
      {children}
    </LineSpacingContext.Provider>
  );
};

export const useLineSpacing = () => {
  const ctx = useContext(LineSpacingContext);
  if (!ctx) {
    return {
      lineSpacing: DEFAULT_LINE_SPACING,
      setLineSpacing: () => {},
    };
  }
  return ctx;
};
