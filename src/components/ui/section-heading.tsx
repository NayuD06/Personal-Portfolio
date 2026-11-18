import { Reveal } from "./reveal";

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeading({ title, subtitle }: Props) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      <div className="bg-brand mx-auto mt-4 h-1 w-16 rounded-full" aria-hidden="true" />
      {subtitle && <p className="mt-5 text-base leading-relaxed text-muted">{subtitle}</p>}
    </Reveal>
  );
}
