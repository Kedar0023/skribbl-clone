import type { ButtonHTMLAttributes, ReactNode } from "react";

type SketchButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fill?: string;
  stroke?: string;
};

export function SketchButton({
  children,
  fill = "#6256d9",
  stroke = "#121212",
  className = "",
  ...props
}: SketchButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={[
        "group relative inline-flex items-center justify-center",
        "px-6 py-3 font-bold text-white",
        "transition-transform duration-150",
        "hover:-translate-y-0.5 active:translate-y-1",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6256d9]/35",
        className,
      ].join(" ")}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full overflow-visible"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
      >
        {/* Slightly uneven fill shape */}
        <path
          d="M3 5 Q20 2 49 4 Q78 1 97 5 L96 35 Q76 38 50 36 Q24 39 4 35 Z"
          fill={fill}
        />

        {/* Two imperfect strokes create the hand-drawn border */}
        <path
          d="M3 5 Q20 2 49 4 Q78 1 97 5 L96 35 Q76 38 50 36 Q24 39 4 35 Z"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 6 Q22 3 49 5 Q77 2 96 6 L95 34 Q75 37 50 35 Q25 38 5 34 Z"
          fill="none"
          stroke={stroke}
          strokeWidth="1"
          opacity="0.55"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="relative z-10">{children}</span>
    </button>
  );
}