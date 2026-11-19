/** Chữ thường, bỏ dấu tiếng Việt: gõ "du an" cũng khớp với "Dự án" */
export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}
