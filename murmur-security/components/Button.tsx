import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gold text-black hover:bg-[#e6c65a]",
  secondary: "bg-panelSoft text-text border border-zinc-700 hover:border-goldSoft",
  danger: "bg-[#2b1010] text-[#ffb6b6] border border-[#5f1c1c] hover:bg-[#351414]",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`w-full rounded-xl2 px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
