"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { compare } from "@/lib/api"
import { Allotment } from "@/lib/types"
import Footer from "@/components/layout/Footer"

const CATEGORIES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"]

export default function ComparePage() {
  const [institute1, setInstitute1] = useState("")
  const [institute2, setInstitute2] = useState("")
  const [program, setProgram] = useState("")
  const [category, setCategory] = useState("OPEN")
  const [data, setData] = useState<Allotment[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault()
    if (!institute1 || !institute2) return
    setLoading(true)
    const res = await compare(
      `${institute1},${institute2}`,
      program || undefined,
      category
    )
    setData(res.data || [])
    setSearched(true)
    setLoading(false)
  }

  const chartData = [1, 2, 3, 4, 5, 6].map((round) => {
    const r1 = data.find(
      (d) => d.round === round && d.institute.toLowerCase().includes(institute1.toLowerCase())
    )
    const r2 = data.find(
      (d) => d.round === round && d.institute.toLowerCase().includes(institute2.toLowerCase())
    )
    return {
      round: `R${round}`,
      [institute1 || "Institute 1"]: r1 ? parseInt(r1.closing_rank) : null,
      [institute2 || "Institute 2"]: r2 ? parseInt(r2.closing_rank) : null,
    }
  })

  return (
    <main className="min-h-screen pt-24 px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black mb-2">Comparison Tool</h1>
        <p className="text-gray-400 mb-8">
          Compare closing ranks of two institutes side by side across all rounds.
        </p>

        <form
          onSubmit={handleCompare}
          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <input
            placeholder="Institute 1 (e.g. Bombay)"
            value={institute1}
            onChange={(e) => setInstitute1(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"
          />
          <input
            placeholder="Institute 2 (e.g. Delhi)"
            value={institute2}
            onChange={(e) => setInstitute2(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"
          />
          <input
            placeholder="Program (e.g. Computer Science)"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       focus:border-[#00AEEF]/50 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#050812]">{c}</option>
            ))}
          </select>
          <div className="lg:col-span-4">
            <button
              type="submit"
              disabled={loading || !institute1 || !institute2}
              className="w-full py-3 bg-[#00AEEF] text-black font-bold rounded-xl
                         hover:bg-[#00AEEF]/90 disabled:opacity-50 transition-all glow-blue"
            >
              {loading ? "Comparing..." : "Compare"}
            </button>
          </div>
        </form>

        {searched && data.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">
            No data found. Try different filters.
          </div>
        )}

        {data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-6 text-gray-300">
                Closing Rank Comparison by Round
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="round"
                    stroke="#4B5563"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#4B5563"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    reversed
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0a1628",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey={institute1 || "Institute 1"}
                    fill="#00AEEF"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey={institute2 || "Institute 2"}
                    fill="#22d3ee"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </motion.div>
      <Footer />
    </main>
  )
}