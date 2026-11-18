import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Font đậm cho tiêu đề trong ảnh xem trước khi chia sẻ link (Montserrat, giấy phép SIL OFL)
const [medium, extraBold] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Montserrat-Medium.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Montserrat-ExtraBold.ttf")),
]);

export const ogFonts = [
  { name: "Montserrat", data: medium, weight: 500 as const, style: "normal" as const },
  { name: "Montserrat", data: extraBold, weight: 800 as const, style: "normal" as const },
];

/** Đọc ảnh trong thư mục public thành chuỗi data: để nhúng vào ảnh xem trước */
export async function publicImage(path: string) {
  const data = await readFile(join(process.cwd(), "public", path), "base64");
  const type = path.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${type};base64,${data}`;
}
