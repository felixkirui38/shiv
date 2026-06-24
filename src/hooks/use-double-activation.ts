"use client";

import { useCallback, useRef } from "react";

/**
 * Fires when the user double-clicks or double-taps within `delayMs`.
 */
export function useDoubleActivation(onActivate: () => void, delayMs = 400) {
  const lastTap = useRef(0);

  const activate = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.preventDefault();
      const now = Date.now();
      if (now - lastTap.current <= delayMs) {
        lastTap.current = 0;
        onActivate();
      } else {
        lastTap.current = now;
      }
    },
    [delayMs, onActivate]
  );

  return {
    onClick: activate,
    onDoubleClick: (e: React.MouseEvent) => {
      e.preventDefault();
      onActivate();
    },
  };
}
