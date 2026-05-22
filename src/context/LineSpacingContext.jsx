import { createContext, useContext, useEffect, useState } from "react";

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
  const [lineSpacing, setLineSpacingState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LINE_SPACING;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LINE_SPACING;
  });

  const setLineSpacing = (value) => {
    setLineSpacingState(value);
    localStorage.setItem(STORAGE_KEY, value);
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
