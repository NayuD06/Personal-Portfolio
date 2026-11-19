// Easter egg cho dân dev: mở DevTools (F12) > Console sẽ thấy chữ DUY AN vẽ bằng ký tự kèm lời mời liên hệ.
// Gõ hire() trong Console thì in ra cách liên hệ và mở khóa bí mật "Dân soi Console" (thẻ thành tích hiện trên trang).

import { profile } from "@/data/profile";
import { ui } from "@/data/ui";
import { foundSecret } from "./extras";
import { pick, type Text } from "./i18n";

declare global {
  interface Window {
    hire?: () => string;
  }
}

const ART = String.raw`
 ____  _   ___   __     _    _   _
|  _ \| | | \ \ / /    / \  | \ | |
| | | | | | |\ V /    / _ \ |  \| |
| |_| | |_| | | |    / ___ \| |\  |
|____/ \___/  |_|   /_/   \_\_| \_|
`;

/** Ngôn ngữ đang chọn trên trang (đọc lúc gọi, nên đổi ngôn ngữ xong gọi hire() vẫn đúng) */
const say = (text: Text) => pick(text, document.documentElement.dataset.lang === "vi" ? "vi" : "en");

let greeted = false;

export function greetConsole() {
  if (greeted) return;
  greeted = true;
  const site = `https://${profile.website}`;
  const github = profile.socials.find((social) => social.icon === "github")?.href;

  console.log(`%c${ART}`, "color:#38bdf8;font-family:monospace;font-weight:bold;line-height:1.15");
  console.log(
    `%c${say(ui.devConsole.hello)}%c\n${say(ui.devConsole.pitch)} ${profile.email}`,
    "font-size:14px;font-weight:bold;color:#60a5fa",
    "font-size:12px",
  );
  console.log(`%c${say(ui.devConsole.hint)}`, "color:#94a3b8;font-style:italic");

  window.hire = () => {
    console.log(`%c${say(ui.devConsole.hired)}`, "font-size:13px;font-weight:bold;color:#60a5fa");
    console.log(
      [`Email:   ${profile.email}`, github && `GitHub:  ${github}`, `CV:      ${site}/cv`, `Website: ${site}`].filter(Boolean).join("\n"),
    );
    foundSecret("console");
    return say(ui.devConsole.done);
  };
}
