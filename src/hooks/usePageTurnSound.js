import { useCallback, useEffect, useRef, useState } from "react";
import { playPageTurnSound } from "../utils/pageTurnSound";

const STORAGE_KEY = "ilmana:flipbook-sound";
const DEFAULT_VOLUME = 0.15;

const readPreference = () => {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "on";
  } catch {
    return true;
  }
};

export const usePageTurnSound = () => {
  const [enabled, setEnabled] = useState(readPreference);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      return undefined;
    }
    return undefined;
  }, [enabled]);

  const play = useCallback((direction) => {
    if (!enabledRef.current) return;
    playPageTurnSound({ direction, volume: DEFAULT_VOLUME });
  }, []);

  const toggle = useCallback(() => setEnabled((value) => !value), []);

  return { enabled, toggle, play };
};
