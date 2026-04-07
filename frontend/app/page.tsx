"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import Footer from "@/components/layout/Footer"

const stats = [
  { label: "Records", value: "72K+" },
  { label: "Institutes", value: "120+" },
  { label: "Rounds", value: "6" },
  { label: "Programs", value: "500+" },
]

const features = [
  {
    title: "Rank Predictor",
    desc: "Enter your JEE rank and get a list of colleges you can get — categorized as safe, target, and dream.",
    href: "/predict",
    icon: "🎯",
  },
  {
    title: "College Explorer",
    desc: "Filter by institute, branch, category, and rank range. Browse the full JoSAA 2025 dataset.",
    href: "/explore",
    icon: "🔍",
  },
  {
    title: "Trends Analysis",
    desc: "See how cutoffs moved round by round. Spot branches with rising or falling competition.",
    href: "/trends",
    icon: "📈",
  },
  {
    title: "Comparison Tool",
    desc: "Compare two colleges or branches side by side across all rounds and categories.",
    href: "/compare",
    icon: "⚡",
  },
  {
    title: "AI Chat",
    desc: "Ask anything in plain English. Our AI queries the database and answers instantly.",
    href: "/chat",
    icon: "🤖",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest
                           uppercase text-[#00AEEF] border border-[#00AEEF]/30 bg-[#00AEEF]/10 mb-8">
            JoSAA 2025 · AI Powered
          </span>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            BEYOND PREDICTION.
            <br />
            <span className="text-[#00AEEF]">TOTAL DOMINATION.</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            The most advanced JoSAA analytics platform. Know exactly which colleges
            you can get — before counselling begins.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/predict"
              className="px-8 py-4 rounded-xl bg-[#00AEEF] text-black font-bold text-base
                         hover:bg-[#00AEEF]/90 transition-all duration-200 glow-blue"
            >
              Predict My College
            </Link>
            <Link
              href="/chat"
              className="px-8 py-4 rounded-xl glass border border-white/10 text-white
                         font-semibold text-base hover:border-[#00AEEF]/40 transition-all duration-200"
            >
              Ask AI
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-[#00AEEF]">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Everything you need to{" "}
            <span className="text-[#00AEEF]">dominate counselling</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Five powerful tools built on real JoSAA data. No guesswork.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={f.href}>
                <div className="glass rounded-2xl p-6 h-full hover:border-[#00AEEF]/30
                                border border-white/5 transition-all duration-300 cursor-pointer group">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00AEEF]
                                 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}