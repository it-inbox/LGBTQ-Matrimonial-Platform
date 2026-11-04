import { useState, useEffect, useRef, useCallback } from "react";

export function useDebounce<T>(
  value: T,
  delay: number = 350
): [T, (immediateValue?: T) => void] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // If value is an empty string, flush immediately for instant clearing
    if (typeof value === "string" && value === "") {
      setDebouncedValue(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  const flushImmediately = useCallback((immediateValue?: T) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setDebouncedValue(immediateValue !== undefined ? immediateValue : value);
  }, [value]);

  return [debouncedValue, flushImmediately];
}

