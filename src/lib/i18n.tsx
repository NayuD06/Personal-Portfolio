// Đa ngôn ngữ (tiếng Anh / tiếng Việt).
// Chữ cần dịch được viết dạng { en: "...", vi: "..." }. Chữ giống nhau ở cả hai ngôn ngữ có thể để chuỗi thường.

export type Lang = "en" | "vi";
export type Text = string | { en: string; vi: string };

/** Lấy chữ theo ngôn ngữ đang chọn (dùng trong client component, cho thuộc tính như placeholder, aria-label). */
export function pick(text: Text, lang: Lang): string {
  return typeof text === "string" ? text : text[lang];
}

/**
 * Hiện chữ theo ngôn ngữ. Dùng được cả trong server component:
 * in sẵn cả hai bản, CSS ẩn bản không dùng nên đổi ngôn ngữ không bị nháy.
 */
export function T({ v }: { v: Text }) {
  if (typeof v === "string") return <>{v}</>;
  return (
    <>
      <span className="l-en">{v.en}</span>
      <span className="l-vi" lang="vi">
        {v.vi}
      </span>
    </>
  );
}

/** Chạy trước khi trang hiện ra: lấy ngôn ngữ đã lưu, chưa có thì theo ngôn ngữ trình duyệt. */
export const langScript = `(function(){try{var l=localStorage.getItem('lang');if(l!=='vi'&&l!=='en'){l=(navigator.language||'').toLowerCase().indexOf('vi')===0?'vi':'en'}var d=document.documentElement;d.setAttribute('data-lang',l);d.lang=l}catch(e){}})()`;
