"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "./i18n";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-lang"] });
  return () => observer.disconnect();
}

const getLang = (): Lang => (document.documentElement.getAttribute("data-lang") === "vi" ? "vi" : "en");

/** Ngôn ngữ đang chọn, tự cập nhật khi người xem bấm đổi. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "en");
}

export function setLang(lang: Lang) {
  const root = document.documentElement;
  root.setAttribute("data-lang", lang);
  root.lang = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // trình duyệt chặn lưu trữ: vẫn đổi được, chỉ không nhớ cho lần sau
  }
}
