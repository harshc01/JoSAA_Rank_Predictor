"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { trends, getInstitutes, getPrograms } from "@/lib/api"
import Autocomplete from "@/components/ui/Autocomplete"
import CustomSelect from "@/components/ui/CustomSelect"
import { TrendPoint } from "@/lib/types"
import Footer from "@/components/layout/Footer"

const CATEGORIES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"]

export default function TrendsPage() {
  const [institute, setInstitute] = useState("")
  const [program, setProgram] = useState("")
  const [category, setCategory] = useState("OPEN")
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [instituteList, setInstituteList] = useState<string[]>([])
  const [programList, setProgramList] = useState<string[]>([])

  // Fetch institutes dynamically. Re-run whenever *program changes.
  useEffect(() => {
    getInstitutes(program)
      .then((res) => { if (res.data) setInstituteList(res.data) })
      .catch((err) => console.error(err))
  }, [program])

  // Fetch programs dynamically. Re-run whenever *institute changes.
  useEffect(() => {
    getPrograms(institute)
      .then((res) => { if (res.data) setProgramList(["ALL", ...res.data]) })
      .catch((err) => console.error(err))
  }, [institute])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await trends({
      institute,
      program: program === "ALL" ? "" : program,
      category
    })
    const grouped: Record<string, TrendPoint> = {}
    for (const r of res.data) {
      const key = `Round ${r.round}`
      if (!grouped[key]) grouped[key] = { round: key, opening: 0, closing: 0 }
      grouped[key].opening = parseInt(r.opening_rank)
      grouped[key].closing = parseInt(r.closing_rank)
    }
    const sorted = Object.values(grouped).sort(
      (a, b) => parseInt(a.round.split(" ")[1]) - parseInt(b.round.split(" ")[1])
    )
    setData(sorted)
    setSearched(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen pt-24 px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black mb-2">Trends Analysis</h1>
        <p className="text-gray-400 mb-8">
          Track how cutoffs move across rounds for any college and branch.
        </p>

        <form
          onSubmit={handleSearch}
          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-[50]"
        >
          <div className="relative z-[60]">
             <label className="text-xs text-gray-500 mb-1 block">Institute</label>
             <Autocomplete
                options={instituteList}
                value={institute}
                onChange={setInstitute}
                placeholder="e.g. Bombay"
             />
          </div>

          <div className="relative z-[50]">
             <label className="text-xs text-gray-500 mb-1 block">Program</label>
             <Autocomplete
                options={programList}
                value={program}
                onChange={setProgram}
                placeholder="e.g. Computer Science (or ALL)"
             />
          </div>

          <div className="relative z-[40]">
             <CustomSelect
                label="Category"
                value={category}
                onChange={setCategory}
                options={CATEGORIES}
             />
          </div>

          <div className="relative z-[10] flex items-end">
             <button
                type="submit"
                disabled={loading || !institute}
                className="w-full py-3 h-[50px] bg-[#00AEEF] text-black font-bold rounded-xl hover:bg-[#00AEEF]/90 disabled:opacity-50 transition-all glow-blue"
             >
                {loading ? "Loading..." : "Analyze"}
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
            className="glass rounded-2xl p-6 relative z-10"
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
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
                <Line
                  type="monotone"
                  dataKey="opening"
                  stroke="#00AEEF"
                  strokeWidth={2}
                  dot={{ fill: "#00AEEF", r: 4 }}
                  name="Opening Rank"
                />
                <Line
                  type="monotone"
                  dataKey="closing"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ fill: "#22d3ee", r: 4 }}
                  name="Closing Rank"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </motion.div>
      <Footer />
    </main>
  )
}