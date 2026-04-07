"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

const links = [
  { href: "/predict", label: "Predict" },
  { href: "/explore", label: "Explorer" },
  { href: "/trends", label: "Trends" },
  { href: "/compare", label: "Compare" },
  { href: "/chat", label: "AI Chat" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          JoSAA<span className="text-[#00AEEF]">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors duration-200 ${
                pathname === l.href
                  ? "text-[#00AEEF]"
                  : "text-gray-400 hover:text-[#00AEEF]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          href="/predict"
          className="px-4 py-2 rounded-lg bg-[#00AEEF]/10 border border-[#00AEEF]/30
                     text-[#00AEEF] text-sm font-medium hover:bg-[#00AEEF]/20
                     transition-all duration-200 glow-blue"
        >
          Get Started
        </Link>
      </div>
    </motion.nav>
  )
}