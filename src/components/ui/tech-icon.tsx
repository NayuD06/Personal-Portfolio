import { icons, type IconName } from "@/lib/icons";

type Props = {
  name: IconName;
  className?: string;
  /** Dùng màu thương hiệu của công nghệ thay vì màu chữ hiện tại */
  brandColor?: boolean;
};

export function TechIcon({ name, className, brandColor = false }: Props) {
  const { Icon, color } = icons[name];
  return (
    <Icon
      aria-hidden="true"
      className={className}
      style={brandColor && color !== "currentColor" ? { color } : undefined}
    />
  );
}
