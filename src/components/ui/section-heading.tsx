import { T, type Text } from "@/lib/i18n";
import { Reveal } from "./reveal";

type Props = {
  /** Nhãn nhỏ dạng thẻ code phía trên tiêu đề, vd. "skills" thành <skills /> */
  tag: string;
  title: Text;
  subtitle?: Text;
};

/** Tiêu đề mục: canh trái, nhãn code nhỏ phía trên, mô tả ở bên phải trên màn hình lớn. */
export function SectionHeading({ tag, title, subtitle }: Props) {
  return (
    <Reveal className="mb-14 grid gap-5 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-end lg:gap-12">
      <div>
        <p className="font-mono text-sm text-brand-blue" aria-hidden="true">
          {`<${tag} />`}
        </p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          <T v={title} />
        </h2>
      </div>
      {subtitle && (
        <p className="border-l-2 border-brand-blue/50 pl-4 leading-relaxed text-muted">
          <T v={subtitle} />
        </p>
      )}
    </Reveal>
  );
}
