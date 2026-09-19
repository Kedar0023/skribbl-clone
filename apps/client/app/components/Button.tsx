import type { ButtonHTMLAttributes, ReactNode } from "react";

type PaperButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "blue" | "ghost"; };

export function PaperButton({ children, variant = "primary", className = "", type = "button", ...props }: PaperButtonProps) {
  const colors = { primary: "bg-paper-pink", secondary: "bg-paper-lilac", blue: "bg-paper-blue", ghost: "bg-white" };
  return <button type={type} {...props} className={`paper-button inline-flex items-center justify-center gap-2 px-5 py-2.5 font-hand text-lg text-paper-black ${colors[variant]} ${className}`}>{children}</button>;
}
