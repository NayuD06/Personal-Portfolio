// Logo chữ DA: chữ D đặc, chữ A được khoét ngay bên trong (An nằm trong Duy), đặt trên nền gradient xanh.
// Hình chỉ là một đường path tô kiểu evenodd (phần chữ A tự thành lỗ), không dùng id hay mask
// nên đặt ở nhiều chỗ trên cùng một trang vẫn hiện đúng. Biểu tượng tab (src/app/icon.svg) dùng cùng hình này.

/** Khung 64x64: chữ D, viền ngoài chữ A, rồi lỗ tam giác phía trên gạch ngang chữ A */
export const LOGO_PATH =
  "M15 12H30C44 12 52 21 52 32S44 52 30 52H15Z M22.96 44.71L33 14.59L43.04 44.71L38.29 46.29L36.53 41L29.47 41L27.71 46.29Z M33 30.41L35.36 37.5L30.64 37.5Z";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`bg-brand grid shrink-0 place-items-center rounded-xl text-white ${className}`}>
      <svg viewBox="0 0 64 64" className="size-full">
        <path fill="currentColor" fillRule="evenodd" d={LOGO_PATH} />
      </svg>
    </span>
  );
}
