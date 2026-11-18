"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Năm hiện tại, tính trên trình duyệt nên luôn đúng mà không cần build lại. */
export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  );
  return <span>{year}</span>;
}
