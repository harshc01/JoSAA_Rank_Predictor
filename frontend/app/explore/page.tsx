"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { explore, getInstitutes, getPrograms } from "@/lib/api"
import { Allotment } from "@/lib/types"
import Footer from "@/components/layout/Footer"
import CustomSelect from "@/components/ui/CustomSelect"
import Autocomplete from "@/components/ui/Autocomplete"

const CATEGORIES = ["", "OPEN", "EWS", "OBC-NCL", "SC", "ST"]
const ROUNDS = ["", "1", "2", "3", "4", "5", "6"]

export default function ExplorePage() {
  const [institute, setInstitute] = useState("")
  const [program, setProgram] = useState("")
  const [category, setCategory] = useState("")
  const [round, setRound] = useState("")
  const [minRank, setMinRank] = useState("")
  const [maxRank, setMaxRank] = useState("")
  const [showJokeModal, setShowJokeModal] = useState(false)
  const [results, setResults] = useState<Allotment[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [instituteList, setInstituteList] = useState<string[]>([])
  const [programList, setProgramList] = useState<string[]>([])

  // Fetch institutes dynamically. Re-run whenever *programme changes.
  useEffect(() => {
    getInstitutes(program)
      .then((res) => { if (res.data) setInstituteList(res.data); })
      .catch((err) => console.error(err));
  }, [program]);

  // Fetch programs dynamically. Re-run whenever *institute changes.
  useEffect(() => {
    getPrograms(institute)
      .then((res) => { if (res.data) setProgramList(["ALL", ...res.data]); })
      .catch((err) => console.error(err));
  }, [institute]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    // prank the prankster modal logic

    if (minRank && maxRank && Number(minRank) > Number(maxRank)) {
      setShowJokeModal(true);
      return; // stop the function completely so it doesnt affect the API
    }

    setLoading(true)
    const params: Record<string, string | number> = {}
    if (institute) params.institute = institute
    if (program && program !== "ALL") params.program = program
    if (category) params.category = category
    if (round && round !== "All Rounds") params.round = Number(round.replace("Round ", ""))
    if (minRank) params.min_rank = Number(minRank)
    if (maxRank) params.max_rank = Number(maxRank)
    
    try {
      const data = await explore(params)
      setResults(data.data || [])
      setSearched(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
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
          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Row 1: Institute and Program */}
          <div className="relative z-[60]">
            <label className="text-xs text-gray-500 mb-1 block">Institute</label>
            <Autocomplete
              options={instituteList}
              value={institute}
              onChange={setInstitute}
              placeholder="e.g. Bombay(in your dreams :p), Delhi"
            />
          </div>
          
          <div className="relative z-[50]">
            <label className="text-xs text-gray-500 mb-1 block">Program</label>
            <Autocomplete
              options={programList}
              value={program}
              onChange={setProgram}
              placeholder="e.g. Computer Science"
            />
          </div>

          {/* CustomSelectr */}
          <div className="relative z-[40]">
            <CustomSelect
              label="Category"
              value={category || "All Categories"}
              onChange={(val) => setCategory(val === "All Categories" ? "" : val)}
              options={["All Categories", "OPEN", "EWS", "OBC-NCL", "SC", "ST"]}
            />
          </div>

          {/* Round, Min Rank, Max Rank */}
          <div className="relative z-[30]">
            <CustomSelect
              label="Round"
              value={round ? `Round ${round}` : "All Rounds"}
              onChange={(val) => setRound(val === "All Rounds" ? "" : val.replace("Round ", ""))}
              options={["All Rounds", "Round 1", "Round 2", "Round 3", "Round 4", "Round 5", "Round 6"]}
            />
          </div>

          <div className="relative z-[20]">
            <label className="text-xs text-gray-500 mb-1 block">Min Rank</label>
            <input
              placeholder="Min Rank"
              type="number"
              value={minRank}
              onChange={(e) => setMinRank(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                         placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"
            />
          </div>

          <div className="relative z-[10]">
            <label className="text-xs text-gray-500 mb-1 block">Max Rank</label>
            <input
              placeholder="Max Rank"
              type="number"
              value={maxRank}
              onChange={(e) => setMaxRank(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                         placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-3 relative z-0 mt-2">
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

                        <td className="px-4 py-3 text-white min-w-[300px] whitespace-normal leading-relaxed font-medium">
                          {r.institute}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-[250px] relative group">
                          <span className="block truncate cursor-help border-b border-dashed border-gray-600/50 pb-0.5 transition-colors group-hover:text-[#00AEEF]">
                            {r.program}
                          </span>
                          <div className="absolute bottom-full left-4 mb-2 hidden group-hover:block z-[100] w-max max-w-[350px] bg-[#050812]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-sm text-gray-200 shadow-2xl border-t-[#00AEEF]/50 whitespace-normal leading-snug pointer-events-none">
                            {r.program}
                          </div>
                        </td>
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
        {/* ACTUAL PRANKING MODAL */}
        {showJokeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-[80vw] h-[80vh] max-w-5xl max-h-[700px] bg-slate-900/90 border border-[#00AEEF]/50 rounded-3xl shadow-[0_0_80px_rgba(0,174,239,0.15)] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden animate-in zoom-in duration-300">
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00AEEF]/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-8">
                <div className="text-6xl mb-4">🌌</div>
                
                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] via-blue-500 to-pink-500 tracking-tight">
                  Hold up, Einstein ke 14.
                </h2>
                
                <p className="text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  You just asked for colleges where the minimum rank is <span className="text-pink-400 font-mono font-bold">{minRank}</span> but the maximum rank is <span className="text-[#00AEEF] font-mono font-bold">{maxRank}</span>.
                </p>
                
                <p className="text-xl text-slate-400 max-w-2xl mx-auto italic">
                  Unless you've discovered a way to reverse the space-time continuum, bribe JoSAA officials with dark matter, or physically move the sun... the minimum rank cannot be larger than the maximum.
                </p>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      setShowJokeModal(false);
                      setMinRank("");
                      setMaxRank(""); // Reset its impossible math
                    }}
                    className="px-10 py-5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-[#00AEEF]/50 rounded-2xl text-white font-black text-xl transition-all shadow-xl hover:shadow-[#00AEEF]/20 uppercase tracking-widest"
                  >
                    My Bad, Back to Reality😒
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      <Footer />
    </main>
  )
}