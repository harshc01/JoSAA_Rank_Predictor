"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { predict } from "@/lib/api"
import { Allotment } from "@/lib/types"
import Footer from "@/components/layout/Footer"
import CustomSelect from "@/components/ui/CustomSelect"

const CATEGORIES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"]
const GENDERS = ["Gender-Neutral", "Female-only (including Supernumerary)"]
const QUOTAS = ["AI", "HS", "OS"]
const ROUNDS = [1, 2, 3, 4, 5, 6]

const CHANCE_STYLES = {
  safe: "text-green-400 border-green-400/30 bg-green-400/10",
  target: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  dream: "text-red-400 border-red-400/30 bg-red-400/10",
}

export default function PredictPage() {
  const [rank, setRank] = useState("")
  const [category, setCategory] = useState("OPEN")
  const [gender, setGender] = useState("Gender-Neutral")
  const [quota, setQuota] = useState("AI")
  const [round, setRound] = useState(1)
  const [results, setResults] = useState<Allotment[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rank) return
    setLoading(true)
    const data = await predict({ rank: Number(rank), category, gender, quota, round })
    setResults(data.data || [])
    setSearched(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen pt-24 px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black mb-2">Rank Predictor</h1>
        <p className="text-gray-400 mb-8">
          Enter your JEE rank to see colleges categorized as safe, target, and dream.
        </p>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Rank Inputx */}
          <div className="lg:col-span-3 relative z-[60]">
            <input
              type="number"
              placeholder="Enter your JEE Rank...."
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                         text-white placeholder-gray-500 focus:border-[#00AEEF]/50
                         focus:outline-none text-lg"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative z-[50]">
            <CustomSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
            />
          </div>

          {/* Gender Dropdown */}
          <div className="relative z-[40]">
            <CustomSelect
              label="Gender"
              value={gender}
              onChange={setGender}
              options={GENDERS}
            />
          </div>

          {/* Quota Dropdown */}
          <div className="relative z-[30]">
            <CustomSelect
              label="Quota"
              value={quota}
              onChange={setQuota}
              options={QUOTAS}
            />
          </div>

          {/* Round Dropdown */}
          <div className="relative z-[20]">
            <CustomSelect
              label="Round"
              value={round.toString()}
              onChange={(val) => setRound(Number(val))}
              options={ROUNDS.map(String)}
            />
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-3 mt-2 relative z-[10]">
            <button
              type="submit"
              disabled={loading || !rank}
              className="w-full py-3 bg-[#00AEEF] text-black font-bold rounded-xl
                         hover:bg-[#00AEEF]/90 disabled:opacity-50 transition-all glow-blue"
            >
              {loading ? "Searching..." : "Predict My Colleges"}
            </button>
          </div>
        </form>

        {searched && results.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">
            No results found. Try a higher rank or different filters.
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">
              {results.length} colleges found for rank{" "}
              <span className="text-white font-bold">{rank}</span>
            </p>
            {results.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-xl p-5 flex flex-wrap items-center justify-between gap-4
                           border border-white/5 hover:border-[#00AEEF]/20 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{r.institute}</p>
                  <p className="text-gray-400 text-sm truncate">{r.program}</p>
                  <p className="text-gray-500 text-xs mt-1">{r.quota} · {r.gender}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Opening</p>
                    <p className="text-white font-mono font-bold">{r.opening_rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Closing</p>
                    <p className="text-white font-mono font-bold">{r.closing_rank}</p>
                  </div>
                  {r.chance && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border
                                     capitalize ${CHANCE_STYLES[r.chance]}`}>
                      {r.chance}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      <Footer />
    </main>
  )
}