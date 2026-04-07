"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { explore } from "@/lib/api"
import { Allotment } from "@/lib/types"
import Footer from "@/components/layout/Footer"

const CATEGORIES = ["", "OPEN", "EWS", "OBC-NCL", "SC", "ST"]
const ROUNDS = ["", "1", "2", "3", "4", "5", "6"]

export default function ExplorePage() {
  const [institute, setInstitute] = useState("")
  const [program, setProgram] = useState("")
  const [category, setCategory] = useState("")
  const [round, setRound] = useState("")
  const [minRank, setMinRank] = useState("")
  const [maxRank, setMaxRank] = useState("")
  const [results, setResults] = useState<Allotment[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const params: Record<string, string | number> = {}
    if (institute) params.institute = institute
    if (program) params.program = program
    if (category) params.category = category
    if (round) params.round = Number(round)
    if (minRank) params.min_rank = Number(minRank)
    if (maxRank) params.max_rank = Number(maxRank)
    const data = await explore(params)
    setResults(data.data || [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen pt-24 px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black mb-2">College Explorer</h1>
        <p className="text-gray-400 mb-8">
          Filter and browse the full JoSAA 2025 dataset.
        </p>

        <form
          onSubmit={handleSearch}
          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <input
            placeholder="Institute (e.g. Bombay, Delhi)"
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
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
              <option key={c} value={c} className="bg-[#050812]">
                {c || "All Categories"}
              </option>
            ))}
          </select>
          <select
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       focus:border-[#00AEEF]/50 focus:outline-none"
          >
            {ROUNDS.map((r) => (
              <option key={r} value={r} className="bg-[#050812]">
                {r ? `Round ${r}` : "All Rounds"}
              </option>
            ))}
          </select>
          <input
            placeholder="Min Rank"
            type="number"
            value={minRank}
            onChange={(e) => setMinRank(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"
          />
          <input
            placeholder="Max Rank"
            type="number"
            value={maxRank}
            onChange={(e) => setMaxRank(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"
          />
          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00AEEF] text-black font-bold rounded-xl
                         hover:bg-[#00AEEF]/90 disabled:opacity-50 transition-all glow-blue"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {searched && results.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">
            No results found. Try different filters.
          </div>
        )}

        {results.length > 0 && (
          <div>
            <p className="text-gray-400 text-sm mb-4">{results.length} results</p>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Institute</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Program</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Category</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Quota</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Round</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium">Opening</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium">Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-4 py-3 text-white max-w-[200px] truncate">{r.institute}</td>
                        <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{r.program}</td>
                        <td className="px-4 py-3 text-gray-400">{r.category}</td>
                        <td className="px-4 py-3 text-gray-400">{r.quota}</td>
                        <td className="px-4 py-3 text-gray-400">{r.round}</td>
                        <td className="px-4 py-3 text-right font-mono text-white">{r.opening_rank}</td>
                        <td className="px-4 py-3 text-right font-mono text-[#00AEEF]">{r.closing_rank}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      <Footer />
    </main>
  )
}