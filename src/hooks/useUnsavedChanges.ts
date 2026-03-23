"use client";

import { useEffect, useCallback, useState } from "react";

const WARNING_MESSAGE = "Imate nespremljene promjene. Ako zatvorite stranicu, promjene će biti izgubljene. Želite li nastaviti?";

export function useUnsavedChanges() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const markDirty = useCallback(() => setHasUnsavedChanges(true), []);
  const markClean = useCallback(() => setHasUnsavedChanges(false), []);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = WARNING_MESSAGE;
      return WARNING_MESSAGE;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const confirmDiscard = useCallback(() => {
    if (!hasUnsavedChanges) return true;
    return window.confirm(WARNING_MESSAGE);
  }, [hasUnsavedChanges]);

  return { hasUnsavedChanges, markDirty, markClean, confirmDiscard };
}
