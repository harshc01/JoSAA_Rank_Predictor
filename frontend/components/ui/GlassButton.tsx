import { ReactNode } from "react"

interface Props {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  variant?: "primary" | "secondary"
  className?: string
}

export default function GlassButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
}: Props) {
  const base = "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
  const variants = {
    primary: "bg-[#00AEEF] text-black hover:bg-[#00AEEF]/90 glow-blue",
    secondary: "glass border border-white/10 text-white hover:border-[#00AEEF]/40",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}