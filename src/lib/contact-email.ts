import { profile } from "@/data/profile";

// Email thông báo khi có người gửi form liên hệ (gửi về cho bạn qua Resend).
// Viết bằng bảng (table) và style nội tuyến vì Gmail, Outlook không hỗ trợ CSS hiện đại.
// Muốn đổi màu hay chữ thì sửa ngay trong file này, xem trước bằng cách gửi thử từ form.

export type ContactFields = { name: string; email: string; phone: string; company: string; message: string };

const color = {
  page: "#e8edf6",
  ink: "#0b1730",
  muted: "#55637d",
  faint: "#8a97b0",
  line: "#e2e8f3",
  blue: "#2563eb",
  blueDark: "#1d4ed8",
  sky: "#0ea5e9",
  night: "#050b18",
  soft: "#f3f6fc",
};

const font = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Giờ Việt Nam, vd. "00:53, Thứ Năm 19/11/2026" */
function vietnamTime(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const weekday = parts.weekday ? parts.weekday.charAt(0).toUpperCase() + parts.weekday.slice(1) : "";
  return `${parts.hour}:${parts.minute}, ${weekday} ${parts.day}/${parts.month}/${parts.year}`;
}

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "?";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Nút bấm "chống vỡ" cho email: bảng có nền màu, link bên trong */
function button(href: string, label: string, primary: boolean) {
  const background = primary ? color.blue : "#ffffff";
  const text = primary ? "#ffffff" : color.blueDark;
  const border = primary ? color.blue : "#c9d6f0";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 8px 10px 0"><tr>
<td bgcolor="${background}" style="background:${background};border:1px solid ${border};border-radius:10px">
<a href="${href}" style="display:inline-block;padding:13px 22px;font-family:${font};font-size:15px;font-weight:700;line-height:1;color:${text};text-decoration:none;border-radius:10px">${label}</a>
</td></tr></table>`;
}

function infoRow(label: string, value: string, first: boolean) {
  const border = first ? "" : `border-top:1px solid ${color.line};`;
  return `<tr>
<td style="${border}padding:12px 0;width:110px;font-family:${font};font-size:13px;color:${color.muted};vertical-align:top">${label}</td>
<td style="${border}padding:12px 0;font-family:${font};font-size:15px;color:${color.ink};font-weight:600;word-break:break-word">${value}</td>
</tr>`;
}

export function renderContactEmail(fields: ContactFields, options: { lang?: string; date?: Date } = {}) {
  const date = options.date ?? new Date();
  const time = vietnamTime(date);
  const site = profile.website || "portfolio";
  const langLabel = options.lang === "vi" ? "Tiếng Việt" : options.lang === "en" ? "Tiếng Anh" : "";

  const name = escapeHtml(fields.name);
  const email = escapeHtml(fields.email);
  const message = escapeHtml(fields.message).replace(/\r?\n/g, "<br>");
  const preview = escapeHtml(fields.message.replace(/\s+/g, " ").slice(0, 110));
  const replySubject = encodeURIComponent(`Re: Tin nhắn từ portfolio của ${profile.name}`);
  const phoneHref = fields.phone.replace(/[^\d+]/g, "");

  const subtitle = [fields.company && escapeHtml(fields.company), email].filter(Boolean).join("<br>");

  const rows = [
    infoRow("Email", `<a href="mailto:${email}" style="color:${color.blueDark};text-decoration:none">${email}</a>`, true),
    fields.phone &&
      infoRow("Điện thoại", `<a href="tel:${phoneHref}" style="color:${color.blueDark};text-decoration:none">${escapeHtml(fields.phone)}</a>`, false),
    fields.company && infoRow("Công ty", escapeHtml(fields.company), false),
    langLabel && infoRow("Ngôn ngữ", `${langLabel} <span style="font-weight:400;color:${color.faint}">(ngôn ngữ người gửi đang xem trang)</span>`, false),
  ]
    .filter(Boolean)
    .join("\n");

  const buttons = [
    button(`mailto:${email}?subject=${replySubject}`, "Trả lời qua email", true),
    fields.phone && button(`tel:${phoneHref}`, `Gọi ${escapeHtml(fields.phone)}`, false),
  ]
    .filter(Boolean)
    .join("");

  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Tin nhắn mới từ ${name}</title>
</head>
<body style="margin:0;padding:0;background:${color.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${color.page}">${preview}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${color.page}" style="background:${color.page}">
<tr><td align="center" style="padding:32px 12px">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 50px -24px rgba(11,23,48,.35)">

<!-- Đầu thư -->
<tr><td bgcolor="${color.night}" style="background:${color.night};padding:26px 32px 30px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="vertical-align:middle">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="40" height="40" align="center" bgcolor="${color.blue}" style="width:40px;height:40px;background:${color.blue};background-image:linear-gradient(135deg,${color.blue},${color.sky});border-radius:11px;font-family:${font};font-size:14px;font-weight:800;color:#ffffff;letter-spacing:-.3px">DA</td>
        <td style="padding-left:12px;font-family:${font};font-size:15px;font-weight:700;color:#ffffff">${escapeHtml(profile.name)}<br><span style="font-size:12px;font-weight:400;color:#8fb3ff">${escapeHtml(site)}</span></td>
      </tr></table>
    </td>
    <td align="right" style="vertical-align:middle;font-family:${font};font-size:12px;color:#7f93b8">Form liên hệ</td>
  </tr></table>
  <p style="margin:26px 0 0;font-family:${font};font-size:26px;line-height:1.25;font-weight:800;color:#ffffff;letter-spacing:-.4px">Bạn có tin nhắn mới</p>
  <p style="margin:6px 0 0;font-family:${font};font-size:14px;color:#8aa0c4">${time}</p>
</td></tr>
<tr><td height="4" bgcolor="${color.blue}" style="height:4px;line-height:4px;font-size:0;background:${color.blue};background-image:linear-gradient(90deg,${color.blue},#60a5fa,${color.sky})">&nbsp;</td></tr>

<!-- Người gửi -->
<tr><td style="padding:28px 32px 6px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td width="52" height="52" align="center" bgcolor="#dbe7ff" style="width:52px;height:52px;background:#dbe7ff;border-radius:26px;font-family:${font};font-size:18px;font-weight:800;color:${color.blueDark}">${escapeHtml(initials(fields.name))}</td>
    <td style="padding-left:14px">
      <p style="margin:0;font-family:${font};font-size:20px;line-height:1.3;font-weight:800;color:${color.ink}">${name}</p>
      <p style="margin:3px 0 0;font-family:${font};font-size:14px;color:${color.muted}">${subtitle}</p>
    </td>
  </tr></table>
</td></tr>

<!-- Lời nhắn -->
<tr><td style="padding:22px 32px 4px">
  <p style="margin:0 0 10px;font-family:${font};font-size:13px;font-weight:700;color:${color.muted}">Lời nhắn</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td bgcolor="${color.soft}" style="background:${color.soft};border-left:4px solid ${color.blue};border-radius:12px;padding:18px 20px;font-family:${font};font-size:15px;line-height:1.7;color:${color.ink}">${message}</td>
  </tr></table>
</td></tr>

<!-- Nút -->
<tr><td style="padding:24px 32px 10px">${buttons}</td></tr>

<!-- Thông tin -->
<tr><td style="padding:8px 32px 26px">
  <p style="margin:0 0 4px;font-family:${font};font-size:13px;font-weight:700;color:${color.muted}">Thông tin người gửi</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${rows}
  </table>
</td></tr>

<tr><td bgcolor="#f7f9fd" style="background:#f7f9fd;border-top:1px solid ${color.line};padding:16px 32px;font-family:${font};font-size:13px;line-height:1.6;color:${color.muted}">
  Bấm <b>Trả lời</b> ngay trong hộp thư cũng được: thư sẽ gửi thẳng tới <a href="mailto:${email}" style="color:${color.blueDark};text-decoration:none">${email}</a>.
</td></tr>
</table>

<p style="margin:18px 0 0;font-family:${font};font-size:12px;color:${color.faint}">Gửi tự động từ form liên hệ trên ${escapeHtml(site)}</p>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `Bạn có tin nhắn mới từ form liên hệ trên ${site}`,
    time,
    "",
    fields.message,
    "",
    "---",
    `Họ tên: ${fields.name}`,
    `Email: ${fields.email}`,
    fields.phone ? `Điện thoại: ${fields.phone}` : null,
    fields.company ? `Công ty: ${fields.company}` : null,
    langLabel ? `Ngôn ngữ người gửi đang xem trang: ${langLabel}` : null,
    "",
    "Bấm Trả lời để trả lời thẳng cho người gửi.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    subject: `Tin nhắn mới từ ${fields.name.replace(/\s+/g, " ")} (portfolio)`,
    html,
    text,
  };
}
