import Link from "next/link";
import type { ReactNode } from "react";

// Hiện câu trả lời của AI: đoạn văn, gạch đầu dòng, **in đậm**, `code` và [link](/duong-dan).
// Dựng bằng phần tử React (không chèn HTML thô), link chỉ nhận đường dẫn trong trang, http(s) và mailto.

type Props = {
  text: string;
  /** Gọi khi bấm link trong trang (vd. để đóng khung chat trên điện thoại) */
  onNavigate?: () => void;
  linkClassName?: string;
};

const inlinePattern = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+[^\s).,!?])/g;

function safeHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return { href, internal: true };
  if (href.startsWith("#")) return { href: `/${href}`, internal: true };
  if (/^(https?:|mailto:)/i.test(href)) return { href, internal: false };
  return null;
}

function inline(text: string, props: Props, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(inlinePattern)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `${keyPrefix}-${index++}`;
    const [, bold, code, label, href, bare] = match;
    if (bold) {
      nodes.push(
        <strong key={key} className="font-bold">
          {bold}
        </strong>,
      );
    } else if (code) {
      nodes.push(
        <code key={key} className="rounded bg-chip px-1 py-0.5 font-mono text-[0.9em]">
          {code}
        </code>,
      );
    } else {
      const target = safeHref(href ?? bare ?? "");
      const content = label ?? bare;
      if (!target) nodes.push(content);
      else if (target.internal) {
        nodes.push(
          <Link key={key} href={target.href} onClick={props.onNavigate} className={props.linkClassName}>
            {content}
          </Link>,
        );
      } else {
        nodes.push(
          <a key={key} href={target.href} target="_blank" rel="noopener noreferrer" className={props.linkClassName}>
            {content}
          </a>,
        );
      }
    }
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function RichText(props: Props) {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let items: string[] = [];
  let ordered = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const key = `p${blocks.length}`;
    blocks.push(
      <p key={key}>
        {paragraph.flatMap((line, i) => (i === 0 ? inline(line, props, `${key}-${i}`) : [<br key={`${key}-br${i}`} />, ...inline(line, props, `${key}-${i}`)]))}
      </p>,
    );
    paragraph = [];
  };
  const flushList = () => {
    if (!items.length) return;
    const key = `l${blocks.length}`;
    const children = items.map((item, i) => <li key={`${key}-${i}`}>{inline(item, props, `${key}-${i}`)}</li>);
    blocks.push(
      ordered ? (
        <ol key={key} className="list-decimal space-y-1 pl-5 marker:text-brand-blue">
          {children}
        </ol>
      ) : (
        <ul key={key} className="list-disc space-y-1 pl-5 marker:text-brand-blue">
          {children}
        </ul>
      ),
    );
    items = [];
  };

  for (const raw of props.text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const number = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || number) {
      flushParagraph();
      if (items.length && ordered !== Boolean(number)) flushList();
      ordered = Boolean(number);
      items.push((bullet ?? number)![1]);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      // bỏ dấu # của tiêu đề nếu model lỡ viết
      paragraph.push(line.replace(/^#{1,6}\s+/, ""));
    }
  }
  flushParagraph();
  flushList();

  return <>{blocks}</>;
}
