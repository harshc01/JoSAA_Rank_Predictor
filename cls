[1mdiff --git a/api/routes.py b/api/routes.py[m
[1mindex c085bfd..5ca0d1f 100644[m
[1m--- a/api/routes.py[m
[1m+++ b/api/routes.py[m
[36m@@ -3,7 +3,6 @@[m [mfrom api.tools import supabase[m
 [m
 router = APIRouter()[m
 [m
[31m-[m
 @router.get("/predict")[m
 async def predict([m
     rank: int,[m
[36m@@ -35,7 +34,6 @@[m [masync def predict([m
             r["chance"] = "dream"[m
     return {"data": rows, "count": len(rows)}[m
 [m
[31m-[m
 @router.get("/explore")[m
 async def explore([m
     institute: str = None,[m
[36m@@ -50,7 +48,7 @@[m [masync def explore([m
     query = supabase.table("seat_allotments").select("*")[m
     if institute:[m
         query = query.ilike("institute", f"%{institute}%")[m
[31m-    if program:[m
[32m+[m[32m    if program and program != "ALL":[m
         query = query.ilike("program", f"%{program}%")[m
     if category:[m
         query = query.eq("category", category)[m
[36m@@ -63,7 +61,6 @@[m [masync def explore([m
     result = query.order("closing_rank").range(offset, offset + limit - 1).execute()[m
     return {"data": result.data, "count": len(result.data)}[m
 [m
[31m-[m
 @router.get("/trends")[m
 async def trends(institute: str = None, program: str = None, category: str = "OPEN"):[m
     query = ([m
[36m@@ -74,12 +71,11 @@[m [masync def trends(institute: str = None, program: str = None, category: str = "OP[m
     )[m
     if institute:[m
         query = query.ilike("institute", f"%{institute}%")[m
[31m-    if program:[m
[32m+[m[32m    if program and program != "ALL":[m
         query = query.ilike("program", f"%{program}%")[m
     result = query.limit(200).execute()[m
     return {"data": result.data}[m
 [m
[31m-[m
 @router.get("/compare")[m
 async def compare(institutes: str = Query(...), program: str = None, category: str = "OPEN"):[m
     names = [i.strip() for i in institutes.split(",")][m
[36m@@ -91,22 +87,33 @@[m [masync def compare(institutes: str = Query(...), program: str = None, category: s[m
             .ilike("institute", f"%{name}%")[m
             .eq("category", category)[m
         )[m
[31m-        if program:[m
[32m+[m[32m        if program and program != "ALL":[m
             query = query.ilike("program", f"%{program}%")[m
[31m-        result = query.order("round").limit(50).execute()[m
[32m+[m[41m            [m
[32m+[m[32m        result = query.order("round").limit(100).execute()[m
         all_data.extend(result.data)[m
     return {"data": all_data}[m
 [m
[31m-[m
 @router.get("/institutes")[m
[31m-async def institutes():[m
[31m-    result = supabase.table("seat_allotments").select("institute").execute()[m
[31m-    names = sorted(set(r["institute"] for r in result.data))[m
[32m+[m[32masync def institutes(program: str = None):[m
[32m+[m[32m    query = supabase.table("seat_allotments").select("institute")[m
[32m+[m[41m    [m
[32m+[m[32m    # branch selected, only return colleges that offer it[m
[32m+[m[32m    if program and program != "ALL":[m
[32m+[m[32m        query = query.ilike("program", f"%{program}%")[m
[32m+[m[41m        [m
[32m+[m[32m    result = query.limit(100000).execute()[m
[32m+[m[32m    names = sorted(set(r["institute"] for r in result.data if r.get("institute")))[m
     return {"data": names}[m
 [m
[31m-[m
 @router.get("/programs")[m
[31m-async def programs():[m
[31m-    result = supabase.table("seat_allotments").select("program").execute()[m
[31m-    names = sorted(set(r["program"] for r in result.data))[m
[31m-    return {"data": names}[m
[32m+[m[32masync def programs(institute: str = None):[m
[32m+[m[32m    query = supabase.table("seat_allotments").select("program")[m
[32m+[m[41m    [m
[32m+[m[32m    # vice versa of upper fxn[m
[32m+[m[32m    if institute:[m
[32m+[m[32m        query = query.ilike("institute", f"%{institute}%")[m
[32m+[m[41m        [m
[32m+[m[32m    result = query.limit(100000).execute()[m
[32m+[m[32m    names = sorted(set(r["program"] for r in result.data if r.get("program")))[m
[32m+[m[32m    return {"data": names}[m
\ No newline at end of file[m
[1mdiff --git a/frontend/app/compare/page.tsx b/frontend/app/compare/page.tsx[m
[1mindex e7a6fa5..d47d7ba 100644[m
[1m--- a/frontend/app/compare/page.tsx[m
[1m+++ b/frontend/app/compare/page.tsx[m
[36m@@ -1,167 +1,100 @@[m
[31m-"use client"[m
[31m-import { useState } from "react"[m
[31m-import { motion } from "framer-motion"[m
[31m-import {[m
[31m-  BarChart,[m
[31m-  Bar,[m
[31m-  XAxis,[m
[31m-  YAxis,[m
[31m-  Tooltip,[m
[31m-  ResponsiveContainer,[m
[31m-  Legend,[m
[31m-} from "recharts"[m
[31m-import { compare } from "@/lib/api"[m
[31m-import { Allotment } from "@/lib/types"[m
[31m-import Footer from "@/components/layout/Footer"[m
[32m+[m[32m"use client";[m
 [m
[31m-const CATEGORIES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"][m
[32m+[m[32mimport { useState, useEffect } from "react";[m
[32m+[m[32mimport Autocomplete from "@/components/ui/Autocomplete";[m
[32m+[m[32mimport CustomSelect from "@/components/ui/CustomSelect";[m
[32m+[m[32mimport { compare, getInstitutes, getPrograms } from "@/lib/api";[m
[32m+[m[32mimport { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";[m
 [m
 export default function ComparePage() {[m
[31m-  const [institute1, setInstitute1] = useState("")[m
[31m-  const [institute2, setInstitute2] = useState("")[m
[31m-  const [program, setProgram] = useState("")[m
[31m-  const [category, setCategory] = useState("OPEN")[m
[31m-  const [data, setData] = useState<Allotment[]>([])[m
[31m-  const [loading, setLoading] = useState(false)[m
[31m-  const [searched, setSearched] = useState(false)[m
[32m+[m[32m  const [instituteList, setInstituteList] = useState<string[]>([]);[m
[32m+[m[32m  const [programList, setProgramList] = useState<string[]>([]);[m
[32m+[m[32m  const [inst1, setInst1] = useState("");[m
[32m+[m[32m  const [inst2, setInst2] = useState("");[m
[32m+[m[32m  const [program, setProgram] = useState("ALL");[m
[32m+[m[32m  const [category, setCategory] = useState("OPEN");[m
[32m+[m[32m  const [chartData, setChartData] = useState<any[]>([]);[m
[32m+[m[32m  const [loading, setLoading] = useState(false);[m
[32m+[m[32m  const [hasSearched, setHasSearched] = useState(false);[m
 [m
[31m-  async function handleCompare(e: React.FormEvent) {[m
[31m-    e.preventDefault()[m
[31m-    if (!institute1 || !institute2) return[m
[31m-    setLoading(true)[m
[31m-    const res = await compare([m
[31m-      `${institute1},${institute2}`,[m
[31m-      program || undefined,[m
[31m-      category[m
[31m-    )[m
[31m-    setData(res.data || [])[m
[31m-    setSearched(true)[m
[31m-    setLoading(false)[m
[31m-  }[m
[32m+[m[32m  useEffect(() => {[m
[32m+[m[32m    getInstitutes().then((res) => { if (res.data) setInstituteList(res.data); });[m
[32m+[m[32m    getPrograms().then((res) => {[m
[32m+[m[32m        if (res.data) setProgramList(["ALL", ...res.data]);[m[41m [m
[32m+[m[32m    });[m
[32m+[m[32m  }, []);[m
 [m
[31m-  const chartData = [1, 2, 3, 4, 5, 6].map((round) => {[m
[31m-    const r1 = data.find([m
[31m-      (d) => d.round === round && d.institute.toLowerCase().includes(institute1.toLowerCase())[m
[31m-    )[m
[31m-    const r2 = data.find([m
[31m-      (d) => d.round === round && d.institute.toLowerCase().includes(institute2.toLowerCase())[m
[31m-    )[m
[31m-    return {[m
[31m-      round: `R${round}`,[m
[31m-      [institute1 || "Institute 1"]: r1 ? parseInt(r1.closing_rank) : null,[m
[31m-      [institute2 || "Institute 2"]: r2 ? parseInt(r2.closing_rank) : null,[m
[31m-    }[m
[31m-  })[m
[32m+[m[32m  const handleCompare = async () => {[m
[32m+[m[32m    if (!inst1 || !inst2) return;[m
[32m+[m[32m    setLoading(true);[m
[32m+[m[32m    setHasSearched(true);[m
[32m+[m[32m    try {[m
[32m+[m[32m      const res = await compare(`${inst1},${inst2}`, program, category);[m
[32m+[m[32m      const formattedData = [1, 2, 3, 4, 5, 6].map((r) => ({ name: `R${r}` }));[m
[32m+[m[32m      const k1 = inst1.toLowerCase();[m
[32m+[m[32m      const k2 = inst2.toLowerCase();[m
[32m+[m
[32m+[m[32m      res.data.forEach((item: any) => {[m
[32m+[m[32m        const rIdx = item.round - 1;[m
[32m+[m[32m        if (rIdx >= 0 && rIdx <= 5) {[m
[32m+[m[32m          const itemInst = item.institute.toLowerCase();[m
[32m+[m[32m          if (itemInst.includes(k1)) formattedData[rIdx][k1] = item.closing_rank;[m
[32m+[m[32m          else if (itemInst.includes(k2)) formattedData[rIdx][k2] = item.closing_rank;[m
[32m+[m[32m        }[m
[32m+[m[32m      });[m
[32m+[m[32m      setChartData(formattedData);[m
[32m+[m[32m    } catch (e) { console.error(e); } finally { setLoading(false); }[m
[32m+[m[32m  };[m
 [m
   return ([m
[31m-    <main className="min-h-screen pt-24 px-6 max-w-6xl mx-auto">[m
[31m-      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>[m
[31m-        <h1 className="text-4xl font-black mb-2">Comparison Tool</h1>[m
[31m-        <p className="text-gray-400 mb-8">[m
[31m-          Compare closing ranks of two institutes side by side across all rounds.[m
[31m-        </p>[m
[32m+[m[32m    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 pt-24 font-sans">[m
[32m+[m[32m      <div className="max-w-6xl mx-auto space-y-8">[m
[32m+[m[32m        <div>[m
[32m+[m[32m          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Comparison Tool</h1>[m
[32m+[m[32m          <p className="text-slate-400">Side-by-side analysis of institute closing ranks.</p>[m
[32m+[m[32m        </div>[m
 [m
[31m-        <form[m
[31m-          onSubmit={handleCompare}[m
[31m-          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"[m
[31m-        >[m
[31m-          <input[m
[31m-            placeholder="Institute 1 (e.g. Bombay)"[m
[31m-            value={institute1}[m
[31m-            onChange={(e) => setInstitute1(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <input[m
[31m-            placeholder="Institute 2 (e.g. Delhi)"[m
[31m-            value={institute2}[m
[31m-            onChange={(e) => setInstitute2(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <input[m
[31m-            placeholder="Program (e.g. Computer Science)"[m
[31m-            value={program}[m
[31m-            onChange={(e) => setProgram(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <select[m
[31m-            value={category}[m
[31m-            onChange={(e) => setCategory(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          >[m
[31m-            {CATEGORIES.map((c) => ([m
[31m-              <option key={c} value={c} className="bg-[#050812]">{c}</option>[m
[31m-            ))}[m
[31m-          </select>[m
[31m-          <div className="lg:col-span-4">[m
[31m-            <button[m
[31m-              type="submit"[m
[31m-              disabled={loading || !institute1 || !institute2}[m
[31m-              className="w-full py-3 bg-[#00AEEF] text-black font-bold rounded-xl[m
[31m-                         hover:bg-[#00AEEF]/90 disabled:opacity-50 transition-all glow-blue"[m
[31m-            >[m
[31m-              {loading ? "Comparing..." : "Compare"}[m
[31m-            </button>[m
[32m+[m[32m        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">[m
[32m+[m[32m          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-50">[m
[32m+[m[32m            <Autocomplete options={instituteList} value={inst1} onChange={setInst1} placeholder="Institute 1" />[m
[32m+[m[32m            <Autocomplete options={instituteList} value={inst2} onChange={setInst2} placeholder="Institute 2" />[m
           </div>[m
[31m-        </form>[m
[31m-[m
[31m-        {searched && data.length === 0 && ([m
[31m-          <div className="glass rounded-2xl p-8 text-center text-gray-400">[m
[31m-            No data found. Try different filters.[m
[32m+[m[41m          [m
[32m+[m[32m          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-40">[m
[32m+[m[32m            <Autocomplete options={programList} value={program} onChange={setProgram} placeholder="Branch (or ALL)" />[m
[32m+[m[32m            <CustomSelect[m[41m [m
[32m+[m[32m                value={category}[m[41m [m
[32m+[m[32m                onChange={setCategory}[m[41m [m
[32m+[m[32m                options={["OPEN", "OBC-NCL", "SC", "ST", "EWS"]}[m[41m [m
[32m+[m[32m            />[m
           </div>[m
[31m-        )}[m
 [m
[31m-        {data.length > 0 && ([m
[31m-          <motion.div[m
[31m-            initial={{ opacity: 0, y: 20 }}[m
[31m-            animate={{ opacity: 1, y: 0 }}[m
[31m-            className="space-y-6"[m
[32m+[m[32m          <button[m
[32m+[m[32m            onClick={handleCompare}[m
[32m+[m[32m            disabled={loading || !inst1 || !inst2}[m
[32m+[m[32m            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg rounded-xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"[m
           >[m
[31m-            <div className="glass rounded-2xl p-6">[m
[31m-              <h2 className="text-lg font-bold mb-6 text-gray-300">[m
[31m-                Closing Rank Comparison by Round[m
[31m-              </h2>[m
[31m-              <ResponsiveContainer width="100%" height={350}>[m
[31m-                <BarChart data={chartData}>[m
[31m-                  <XAxis[m
[31m-                    dataKey="round"[m
[31m-                    stroke="#4B5563"[m
[31m-                    tick={{ fill: "#9CA3AF", fontSize: 12 }}[m
[31m-                  />[m
[31m-                  <YAxis[m
[31m-                    stroke="#4B5563"[m
[31m-                    tick={{ fill: "#9CA3AF", fontSize: 12 }}[m
[31m-                    reversed[m
[31m-                  />[m
[31m-                  <Tooltip[m
[31m-                    contentStyle={{[m
[31m-                      background: "#0a1628",[m
[31m-                      border: "1px solid rgba(255,255,255,0.1)",[m
[31m-                      borderRadius: "12px",[m
[31m-                      color: "#fff",[m
[31m-                    }}[m
[31m-                  />[m
[31m-                  <Legend />[m
[31m-                  <Bar[m
[31m-                    dataKey={institute1 || "Institute 1"}[m
[31m-                    fill="#00AEEF"[m
[31m-                    radius={[4, 4, 0, 0]}[m
[31m-                  />[m
[31m-                  <Bar[m
[31m-                    dataKey={institute2 || "Institute 2"}[m
[31m-                    fill="#22d3ee"[m
[31m-                    radius={[4, 4, 0, 0]}[m
[31m-                  />[m
[31m-                </BarChart>[m
[31m-              </ResponsiveContainer>[m
[31m-            </div>[m
[31m-          </motion.div>[m
[32m+[m[32m            {loading ? "Analyzing..." : "Compare Institutes"}[m
[32m+[m[32m          </button>[m
[32m+[m[32m        </div>[m
[32m+[m
[32m+[m[32m        {hasSearched && chartData.length > 0 && ([m
[32m+[m[32m          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl h-[600px] relative z-10">[m
[32m+[m[32m            <h2 className="text-xl font-bold text-white mb-6">Closing Rank Comparison by Round</h2>[m
[32m+[m[32m            <ResponsiveContainer width="100%" height="100%">[m
[32m+[m[32m              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>[m
[32m+[m[32m                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />[m
[32m+[m[32m                <XAxis dataKey="name" stroke="#64748b" />[m
[32m+[m[32m                <YAxis reversed stroke="#64748b" />[m
[32m+[m[32m                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#e2e8f0' }} />[m
[32m+[m[32m                <Legend wrapperStyle={{ paddingTop: '30px' }} />[m
[32m+[m[32m                <Bar dataKey={inst1.toLowerCase()} fill="#06b6d4" name={inst1} radius={[6, 6, 0, 0]} />[m
[32m+[m[32m                <Bar dataKey={inst2.toLowerCase()} fill="#ec4899" name={inst2} radius={[6, 6, 0, 0]} />[m
[32m+[m[32m              </BarChart>[m
[32m+[m[32m            </ResponsiveContainer>[m
[32m+[m[32m          </div>[m
         )}[m
[31m-      </motion.div>[m
[31m-      <Footer />[m
[31m-    </main>[m
[31m-  )[m
[32m+[m[32m      </div>[m
[32m+[m[32m    </div>[m
[32m+[m[32m  );[m
 }[m
\ No newline at end of file[m
[1mdiff --git a/frontend/app/explore/page.tsx b/frontend/app/explore/page.tsx[m
[1mindex a1c2663..df3a6b0 100644[m
[1m--- a/frontend/app/explore/page.tsx[m
[1m+++ b/frontend/app/explore/page.tsx[m
[36m@@ -1,9 +1,11 @@[m
 "use client"[m
[31m-import { useState } from "react"[m
[32m+[m[32mimport { useState, useEffect } from "react"[m
 import { motion } from "framer-motion"[m
[31m-import { explore } from "@/lib/api"[m
[32m+[m[32mimport { explore, getInstitutes, getPrograms } from "@/lib/api"[m
 import { Allotment } from "@/lib/types"[m
 import Footer from "@/components/layout/Footer"[m
[32m+[m[32mimport CustomSelect from "@/components/ui/CustomSelect"[m
[32m+[m[32mimport Autocomplete from "@/components/ui/Autocomplete"[m
 [m
 const CATEGORIES = ["", "OPEN", "EWS", "OBC-NCL", "SC", "ST"][m
 const ROUNDS = ["", "1", "2", "3", "4", "5", "6"][m
[36m@@ -15,24 +17,55 @@[m [mexport default function ExplorePage() {[m
   const [round, setRound] = useState("")[m
   const [minRank, setMinRank] = useState("")[m
   const [maxRank, setMaxRank] = useState("")[m
[32m+[m[32m  const [showJokeModal, setShowJokeModal] = useState(false)[m
   const [results, setResults] = useState<Allotment[]>([])[m
   const [loading, setLoading] = useState(false)[m
   const [searched, setSearched] = useState(false)[m
[32m+[m[32m  const [instituteList, setInstituteList] = useState<string[]>([])[m
[32m+[m[32m  const [programList, setProgramList] = useState<string[]>([])[m
[32m+[m
[32m+[m[32m  // Fetch institutes dynamically. Re-run whenever *programme changes.[m
[32m+[m[32m  useEffect(() => {[m
[32m+[m[32m    getInstitutes(program)[m
[32m+[m[32m      .then((res) => { if (res.data) setInstituteList(res.data); })[m
[32m+[m[32m      .catch((err) => console.error(err));[m
[32m+[m[32m  }, [program]);[m
[32m+[m
[32m+[m[32m  // Fetch programs dynamically. Re-run whenever *institute changes.[m
[32m+[m[32m  useEffect(() => {[m
[32m+[m[32m    getPrograms(institute)[m
[32m+[m[32m      .then((res) => { if (res.data) setProgramList(["ALL", ...res.data]); })[m
[32m+[m[32m      .catch((err) => console.error(err));[m
[32m+[m[32m  }, [institute]);[m
 [m
   async function handleSearch(e: React.FormEvent) {[m
     e.preventDefault()[m
[32m+[m
[32m+[m[32m    // prank the prankster modal logic[m
[32m+[m
[32m+[m[32m    if (minRank && maxRank && Number(minRank) > Number(maxRank)) {[m
[32m+[m[32m      setShowJokeModal(true);[m
[32m+[m[32m      return; // stop the function completely so it doesnt affect the API[m
[32m+[m[32m    }[m
[32m+[m
     setLoading(true)[m
     const params: Record<string, string | number> = {}[m
     if (institute) params.institute = institute[m
[31m-    if (program) params.program = program[m
[32m+[m[32m    if (program && program !== "ALL") params.program = program[m
     if (category) params.category = category[m
[31m-    if (round) params.round = Number(round)[m
[32m+[m[32m    if (round && round !== "All Rounds") params.round = Number(round.replace("Round ", ""))[m
     if (minRank) params.min_rank = Number(minRank)[m
     if (maxRank) params.max_rank = Number(maxRank)[m
[31m-    const data = await explore(params)[m
[31m-    setResults(data.data || [])[m
[31m-    setSearched(true)[m
[31m-    setLoading(false)[m
[32m+[m[41m    [m
[32m+[m[32m    try {[m
[32m+[m[32m      const data = await explore(params)[m
[32m+[m[32m      setResults(data.data || [])[m
[32m+[m[32m      setSearched(true)[m
[32m+[m[32m    } catch (error) {[m
[32m+[m[32m      console.error(error)[m
[32m+[m[32m    } finally {[m
[32m+[m[32m      setLoading(false)[m
[32m+[m[32m    }[m
   }[m
 [m
   return ([m
[36m@@ -45,63 +78,74 @@[m [mexport default function ExplorePage() {[m
 [m
         <form[m
           onSubmit={handleSearch}[m
[31m-          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"[m
[32m+[m[32m          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"[m
         >[m
[31m-          <input[m
[31m-            placeholder="Institute (e.g. Bombay, Delhi)"[m
[31m-            value={institute}[m
[31m-            onChange={(e) => setInstitute(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <input[m
[31m-            placeholder="Program (e.g. Computer Science)"[m
[31m-            value={program}[m
[31m-            onChange={(e) => setProgram(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <select[m
[31m-            value={category}[m
[31m-            onChange={(e) => setCategory(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          >[m
[31m-            {CATEGORIES.map((c) => ([m
[31m-              <option key={c} value={c} className="bg-[#050812]">[m
[31m-                {c || "All Categories"}[m
[31m-              </option>[m
[31m-            ))}[m
[31m-          </select>[m
[31m-          <select[m
[31m-            value={round}[m
[31m-            onChange={(e) => setRound(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          >[m
[31m-            {ROUNDS.map((r) => ([m
[31m-              <option key={r} value={r} className="bg-[#050812]">[m
[31m-                {r ? `Round ${r}` : "All Rounds"}[m
[31m-              </option>[m
[31m-            ))}[m
[31m-          </select>[m
[31m-          <input[m
[31m-            placeholder="Min Rank"[m
[31m-            type="number"[m
[31m-            value={minRank}[m
[31m-            onChange={(e) => setMinRank(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <input[m
[31m-            placeholder="Max Rank"[m
[31m-            type="number"[m
[31m-            value={maxRank}[m
[31m-            onChange={(e) => setMaxRank(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <div className="lg:col-span-3">[m
[32m+[m[32m          {/* Row 1: Institute and Program */}[m
[32m+[m[32m          <div className="relative z-[60]">[m
[32m+[m[32m            <label className="text-xs text-gray-500 mb-1 block">Institute</label>[m
[32m+[m[32m            <Autocomplete[m
[32m+[m[32m              options={instituteList}[m
[32m+[m[32m              value={institute}[m
[32m+[m[32m              onChange={setInstitute}[m
[32m+[m[32m              placeholder="e.g. Bombay(in your dreams :p), Delhi"[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
[32m+[m[41m          [m
[32m+[m[32m          <div className="relative z-[50]">[m
[32m+[m[32m            <label className="text-xs text-gray-500 mb-1 block">Program</label>[m
[32m+[m[32m            <Autocomplete[m
[32m+[m[32m              options={programList}[m
[32m+[m[32m              value={program}[m
[32m+[m[32m              onChange={setProgram}[m
[32m+[m[32m              placeholder="e.g. Computer Science"[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          {/* CustomSelectr */}[m
[32m+[m[32m          <div className="relative z-[40]">[m
[32m+[m[32m            <CustomSelect[m
[32m+[m[32m              label="Category"[m
[32m+[m[32m              value={category || "All Categories"}[m
[32m+[m[32m              onChange={(val) => setCategory(val === "All Categories" ? "" : val)}[m
[32m+[m[32m              options={["All Categories", "OPEN", "EWS", "OBC-NCL", "SC", "ST"]}[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          {/* Round, Min Rank, Max Rank */}[m
[32m+[m[32m          <div className="relative z-[30]">[m
[32m+[m[32m            <CustomSelect[m
[32m+[m[32m              label="Round"[m
[32m+[m[32m              value={round ? `Round ${round}` : "All Rounds"}[m
[32m+[m[32m              onChange={(val) => setRound(val === "All Rounds" ? "" : val.replace("Round ", ""))}[m
[32m+[m[32m              options={["All Rounds", "Round 1", "Round 2", "Round 3", "Round 4", "Round 5", "Round 6"]}[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          <div className="relative z-[20]">[m
[32m+[m[32m            <label className="text-xs text-gray-500 mb-1 block">Min Rank</label>[m
[32m+[m[32m            <input[m
[32m+[m[32m              placeholder="Min Rank"[m
[32m+[m[32m              type="number"[m
[32m+[m[32m              value={minRank}[m
[32m+[m[32m              onChange={(e) => setMinRank(e.target.value)}[m
[32m+[m[32m              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[32m+[m[32m                         placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          <div className="relative z-[10]">[m
[32m+[m[32m            <label className="text-xs text-gray-500 mb-1 block">Max Rank</label>[m
[32m+[m[32m            <input[m
[32m+[m[32m              placeholder="Max Rank"[m
[32m+[m[32m              type="number"[m
[32m+[m[32m              value={maxRank}[m
[32m+[m[32m              onChange={(e) => setMaxRank(e.target.value)}[m
[32m+[m[32m              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[32m+[m[32m                         placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          <div className="lg:col-span-3 relative z-0 mt-2">[m
             <button[m
               type="submit"[m
               disabled={loading}[m
[36m@@ -145,8 +189,18 @@[m [mexport default function ExplorePage() {[m
                         transition={{ delay: i * 0.02 }}[m
                         className="border-b border-white/5 hover:bg-white/2 transition-colors"[m
                       >[m
[31m-                        <td className="px-4 py-3 text-white max-w-[200px] truncate">{r.institute}</td>[m
[31m-                        <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{r.program}</td>[m
[32m+[m
[32m+[m[32m                        <td className="px-4 py-3 text-white min-w-[300px] whitespace-normal leading-relaxed font-medium">[m
[32m+[m[32m                          {r.institute}[m
[32m+[m[32m                        </td>[m
[32m+[m[32m                        <td className="px-4 py-3 text-gray-300 max-w-[250px] relative group">[m
[32m+[m[32m                          <span className="block truncate cursor-help border-b border-dashed border-gray-600/50 pb-0.5 transition-colors group-hover:text-[#00AEEF]">[m
[32m+[m[32m                            {r.program}[m
[32m+[m[32m                          </span>[m
[32m+[m[32m                          <div className="absolute bottom-full left-4 mb-2 hidden group-hover:block z-[100] w-max max-w-[350px] bg-[#050812]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-sm text-gray-200 shadow-2xl border-t-[#00AEEF]/50 whitespace-normal leading-snug pointer-events-none">[m
[32m+[m[32m                            {r.program}[m
[32m+[m[32m                          </div>[m
[32m+[m[32m                        </td>[m
                         <td className="px-4 py-3 text-gray-400">{r.category}</td>[m
                         <td className="px-4 py-3 text-gray-400">{r.quota}</td>[m
                         <td className="px-4 py-3 text-gray-400">{r.round}</td>[m
[36m@@ -160,6 +214,44 @@[m [mexport default function ExplorePage() {[m
             </div>[m
           </div>[m
         )}[m
[32m+[m[32m        {/* ACTUAL PRANKING MODAL */}[m
[32m+[m[32m        {showJokeModal && ([m
[32m+[m[32m          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">[m
[32m+[m[32m            <div className="w-[80vw] h-[80vh] max-w-5xl max-h-[700px] bg-slate-900/90 border border-[#00AEEF]/50 rounded-3xl shadow-[0_0_80px_rgba(0,174,239,0.15)] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden animate-in zoom-in duration-300">[m
[32m+[m[41m              [m
[32m+[m[32m              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00AEEF]/10 blur-[100px] rounded-full pointer-events-none" />[m
[32m+[m
[32m+[m[32m              <div className="relative z-10 space-y-8">[m
[32m+[m[32m                <div className="text-6xl mb-4">🌌</div>[m
[32m+[m[41m                [m
[32m+[m[32m                <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] via-blue-500 to-pink-500 tracking-tight">[m
[32m+[m[32m                  Hold up, Einstein ke 14.[m
[32m+[m[32m                </h2>[m
[32m+[m[41m                [m
[32m+[m[32m                <p className="text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed">[m
[32m+[m[32m                  You just asked for colleges where the minimum rank is <span className="text-pink-400 font-mono font-bold">{minRank}</span> but the maximum rank is <span className="text-[#00AEEF] font-mono font-bold">{maxRank}</span>.[m
[32m+[m[32m                </p>[m
[32m+[m[41m                [m
[32m+[m[32m                <p className="text-xl text-slate-400 max-w-2xl mx-auto italic">[m
[32m+[m[32m                  Unless you've discovered a way to reverse the space-time continuum, bribe JoSAA officials with dark matter, or physically move the sun... the minimum rank cannot be larger than the maximum.[m
[32m+[m[32m                </p>[m
[32m+[m
[32m+[m[32m                <div className="pt-8">[m
[32m+[m[32m                  <button[m
[32m+[m[32m                    onClick={() => {[m
[32m+[m[32m                      setShowJokeModal(false);[m
[32m+[m[32m                      setMinRank("");[m
[32m+[m[32m                      setMaxRank(""); // Reset its impossible math[m
[32m+[m[32m                    }}[m
[32m+[m[32m                    className="px-10 py-5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-[#00AEEF]/50 rounded-2xl text-white font-black text-xl transition-all shadow-xl hover:shadow-[#00AEEF]/20 uppercase tracking-widest"[m
[32m+[m[32m                  >[m
[32m+[m[32m                    My Bad, Back to Reality😒[m
[32m+[m[32m                  </button>[m
[32m+[m[32m                </div>[m
[32m+[m[32m              </div>[m
[32m+[m[32m            </div>[m
[32m+[m[32m          </div>[m
[32m+[m[32m        )}[m
       </motion.div>[m
       <Footer />[m
     </main>[m
[1mdiff --git a/frontend/app/globals.css b/frontend/app/globals.css[m
[1mindex 42edc9b..d9feb1a 100644[m
[1m--- a/frontend/app/globals.css[m
[1m+++ b/frontend/app/globals.css[m
[36m@@ -17,4 +17,34 @@[m [mbody {[m
   background: rgba(255, 255, 255, 0.03);[m
   backdrop-filter: blur(12px);[m
   border: 1px solid rgba(255, 255, 255, 0.08);[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m/* Custom Cyberpunk Scrollbar*/[m
[32m+[m[32m.custom-scrollbar::-webkit-scrollbar {[m
[32m+[m[32m  width: 8px;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.custom-scrollbar::-webkit-scrollbar-track {[m
[32m+[m[32m  background: rgba(15, 23, 42, 0.5);[m
[32m+[m[32m  border-radius: 4px;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.custom-scrollbar::-webkit-scrollbar-thumb {[m
[32m+[m[32m  background: rgba(6, 182, 212, 0.5);[m
[32m+[m[32m  border-radius: 4px;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.custom-scrollbar::-webkit-scrollbar-thumb:hover {[m
[32m+[m[32m  background: rgba(6, 182, 212, 0.9);[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32minput::-webkit-outer-spin-button,[m
[32m+[m[32minput::-webkit-inner-spin-button {[m
[32m+[m[32m  -webkit-appearance: none;[m
[32m+[m[32m  margin: 0;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m/* Firefox tries playing differently */[m
[32m+[m[32minput[type="number"] {[m
[32m+[m[32m  -moz-appearance: textfield;[m
 }[m
\ No newline at end of file[m
[1mdiff --git a/frontend/app/predict/page.tsx b/frontend/app/predict/page.tsx[m
[1mindex a0048bf..80ab244 100644[m
[1m--- a/frontend/app/predict/page.tsx[m
[1m+++ b/frontend/app/predict/page.tsx[m
[36m@@ -4,6 +4,7 @@[m [mimport { motion } from "framer-motion"[m
 import { predict } from "@/lib/api"[m
 import { Allotment } from "@/lib/types"[m
 import Footer from "@/components/layout/Footer"[m
[32m+[m[32mimport CustomSelect from "@/components/ui/CustomSelect"[m
 [m
 const CATEGORIES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"][m
 const GENDERS = ["Gender-Neutral", "Female-only (including Supernumerary)"][m
[36m@@ -21,7 +22,7 @@[m [mexport default function PredictPage() {[m
   const [category, setCategory] = useState("OPEN")[m
   const [gender, setGender] = useState("Gender-Neutral")[m
   const [quota, setQuota] = useState("AI")[m
[31m-  const [round, setRound] = useState(6)[m
[32m+[m[32m  const [round, setRound] = useState(1)[m
   const [results, setResults] = useState<Allotment[]>([])[m
   const [loading, setLoading] = useState(false)[m
   const [searched, setSearched] = useState(false)[m
[36m@@ -44,14 +45,12 @@[m [mexport default function PredictPage() {[m
           Enter your JEE rank to see colleges categorized as safe, target, and dream.[m
         </p>[m
 [m
[31m-        <form[m
[31m-          onSubmit={handleSubmit}[m
[31m-          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"[m
[31m-        >[m
[31m-          <div className="lg:col-span-3">[m
[32m+[m[32m        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">[m
[32m+[m[32m          {/* Rank Inputx */}[m
[32m+[m[32m          <div className="lg:col-span-3 relative z-[60]">[m
             <input[m
               type="number"[m
[31m-              placeholder="Enter your JEE Rank"[m
[32m+[m[32m              placeholder="Enter your JEE Rank...."[m
               value={rank}[m
               onChange={(e) => setRank(e.target.value)}[m
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3[m
[36m@@ -60,56 +59,48 @@[m [mexport default function PredictPage() {[m
             />[m
           </div>[m
 [m
[31m-          {[[m
[31m-            {[m
[31m-              label: "Category",[m
[31m-              value: category,[m
[31m-              setter: setCategory,[m
[31m-              options: CATEGORIES,[m
[31m-            },[m
[31m-            {[m
[31m-              label: "Gender",[m
[31m-              value: gender,[m
[31m-              setter: setGender,[m
[31m-              options: GENDERS,[m
[31m-            },[m
[31m-            {[m
[31m-              label: "Quota",[m
[31m-              value: quota,[m
[31m-              setter: setQuota,[m
[31m-              options: QUOTAS,[m
[31m-            },[m
[31m-          ].map((field) => ([m
[31m-            <div key={field.label}>[m
[31m-              <label className="text-xs text-gray-500 mb-1 block">{field.label}</label>[m
[31m-              <select[m
[31m-                value={field.value}[m
[31m-                onChange={(e) => field.setter(e.target.value)}[m
[31m-                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3[m
[31m-                           text-white focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-              >[m
[31m-                {field.options.map((o) => ([m
[31m-                  <option key={o} value={o} className="bg-[#050812]">{o}</option>[m
[31m-                ))}[m
[31m-              </select>[m
[31m-            </div>[m
[31m-          ))}[m
[32m+[m[32m          {/* Category Dropdown */}[m
[32m+[m[32m          <div className="relative z-[50]">[m
[32m+[m[32m            <CustomSelect[m
[32m+[m[32m              label="Category"[m
[32m+[m[32m              value={category}[m
[32m+[m[32m              onChange={setCategory}[m
[32m+[m[32m              options={CATEGORIES}[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
 [m
[31m-          <div>[m
[31m-            <label className="text-xs text-gray-500 mb-1 block">Round</label>[m
[31m-            <select[m
[31m-              value={round}[m
[31m-              onChange={(e) => setRound(Number(e.target.value))}[m
[31m-              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3[m
[31m-                         text-white focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-            >[m
[31m-              {ROUNDS.map((r) => ([m
[31m-                <option key={r} value={r} className="bg-[#050812]">Round {r}</option>[m
[31m-              ))}[m
[31m-            </select>[m
[32m+[m[32m          {/* Gender Dropdown */}[m
[32m+[m[32m          <div className="relative z-[40]">[m
[32m+[m[32m            <CustomSelect[m
[32m+[m[32m              label="Gender"[m
[32m+[m[32m              value={gender}[m
[32m+[m[32m              onChange={setGender}[m
[32m+[m[32m              options={GENDERS}[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          {/* Quota Dropdown */}[m
[32m+[m[32m          <div className="relative z-[30]">[m
[32m+[m[32m            <CustomSelect[m
[32m+[m[32m              label="Quota"[m
[32m+[m[32m              value={quota}[m
[32m+[m[32m              onChange={setQuota}[m
[32m+[m[32m              options={QUOTAS}[m
[32m+[m[32m            />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          {/* Round Dropdown */}[m
[32m+[m[32m          <div className="relative z-[20]">[m
[32m+[m[32m            <CustomSelect[m
[32m+[m[32m              label="Round"[m
[32m+[m[32m              value={round.toString()}[m
[32m+[m[32m              onChange={(val) => setRound(Number(val))}[m
[32m+[m[32m              options={ROUNDS.map(String)}[m
[32m+[m[32m            />[m
           </div>[m
 [m
[31m-          <div className="lg:col-span-3">[m
[32m+[m[32m          {/* Submit Button */}[m
[32m+[m[32m          <div className="lg:col-span-3 mt-2 relative z-[10]">[m
             <button[m
               type="submit"[m
               disabled={loading || !rank}[m
[1mdiff --git a/frontend/app/trends/page.tsx b/frontend/app/trends/page.tsx[m
[1mindex 6a7c9f7..f8eea56 100644[m
[1m--- a/frontend/app/trends/page.tsx[m
[1m+++ b/frontend/app/trends/page.tsx[m
[36m@@ -1,5 +1,5 @@[m
 "use client"[m
[31m-import { useState } from "react"[m
[32m+[m[32mimport { useState, useEffect } from "react"[m
 import { motion } from "framer-motion"[m
 import {[m
   LineChart,[m
[36m@@ -10,7 +10,9 @@[m [mimport {[m
   ResponsiveContainer,[m
   Legend,[m
 } from "recharts"[m
[31m-import { trends } from "@/lib/api"[m
[32m+[m[32mimport { trends, getInstitutes, getPrograms } from "@/lib/api"[m
[32m+[m[32mimport Autocomplete from "@/components/ui/Autocomplete"[m
[32m+[m[32mimport CustomSelect from "@/components/ui/CustomSelect"[m
 import { TrendPoint } from "@/lib/types"[m
 import Footer from "@/components/layout/Footer"[m
 [m
[36m@@ -23,11 +25,31 @@[m [mexport default function TrendsPage() {[m
   const [data, setData] = useState<TrendPoint[]>([])[m
   const [loading, setLoading] = useState(false)[m
   const [searched, setSearched] = useState(false)[m
[32m+[m[32m  const [instituteList, setInstituteList] = useState<string[]>([])[m
[32m+[m[32m  const [programList, setProgramList] = useState<string[]>([])[m
[32m+[m
[32m+[m[32m  // Fetch institutes dynamically. Re-run whenever *program changes.[m
[32m+[m[32m  useEffect(() => {[m
[32m+[m[32m    getInstitutes(program)[m
[32m+[m[32m      .then((res) => { if (res.data) setInstituteList(res.data) })[m
[32m+[m[32m      .catch((err) => console.error(err))[m
[32m+[m[32m  }, [program])[m
[32m+[m
[32m+[m[32m  // Fetch programs dynamically. Re-run whenever *institute changes.[m
[32m+[m[32m  useEffect(() => {[m
[32m+[m[32m    getPrograms(institute)[m
[32m+[m[32m      .then((res) => { if (res.data) setProgramList(["ALL", ...res.data]) })[m
[32m+[m[32m      .catch((err) => console.error(err))[m
[32m+[m[32m  }, [institute])[m
 [m
   async function handleSearch(e: React.FormEvent) {[m
     e.preventDefault()[m
     setLoading(true)[m
[31m-    const res = await trends({ institute, program, category })[m
[32m+[m[32m    const res = await trends({[m
[32m+[m[32m      institute,[m
[32m+[m[32m      program: program === "ALL" ? "" : program,[m
[32m+[m[32m      category[m
[32m+[m[32m    })[m
     const grouped: Record<string, TrendPoint> = {}[m
     for (const r of res.data) {[m
       const key = `Round ${r.round}`[m
[36m@@ -53,40 +75,46 @@[m [mexport default function TrendsPage() {[m
 [m
         <form[m
           onSubmit={handleSearch}[m
[31m-          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"[m
[32m+[m[32m          className="glass rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-[50]"[m
         >[m
[31m-          <input[m
[31m-            placeholder="Institute (e.g. Bombay)"[m
[31m-            value={institute}[m
[31m-            onChange={(e) => setInstitute(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <input[m
[31m-            placeholder="Program (e.g. Computer Science)"[m
[31m-            value={program}[m
[31m-            onChange={(e) => setProgram(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       placeholder-gray-500 focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          />[m
[31m-          <select[m
[31m-            value={category}[m
[31m-            onChange={(e) => setCategory(e.target.value)}[m
[31m-            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white[m
[31m-                       focus:border-[#00AEEF]/50 focus:outline-none"[m
[31m-          >[m
[31m-            {CATEGORIES.map((c) => ([m
[31m-              <option key={c} value={c} className="bg-[#050812]">{c}</option>[m
[31m-            ))}[m
[31m-          </select>[m
[31m-          <button[m
[31m-            type="submit"[m
[31m-            disabled={loading}[m
[31m-            className="py-3 bg-[#00AEEF] text-black font-bold rounded-xl[m
[31m-                       hover:bg-[#00AEEF]/90 disabled:opacity-50 transition-all glow-blue"[m
[31m-          >[m
[31m-            {loading ? "Loading..." : "Analyze"}[m
[31m-          </button>[m
[32m+[m[32m          <div className="relative z-[60]">[m
[32m+[m[32m             <label className="text-xs text-gray-500 mb-1 block">Institute</label>[m
[32m+[m[32m             <Autocomplete[m
[32m+[m[32m                options={instituteList}[m
[32m+[m[32m                value={institute}[m
[32m+[m[32m                onChange={setInstitute}[m
[32m+[m[32m                placeholder="e.g. Bombay"[m
[32m+[m[32m             />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          <div className="relative z-[50]">[m
[32m+[m[32m             <label className="text-xs text-gray-500 mb-1 block">Program</label>[m
[32m+[m[32m             <Autocomplete[m
[32m+[m[32m                options={programList}[m
[32m+[m[32m                value={program}[m
[32m+[m[32m                onChange={setProgram}[m
[32m+[m[32m                placeholder="e.g. Computer Science (or ALL)"[m
[32m+[m[32m             />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          <div className="relative z-[40]">[m
[32m+[m[32m             <CustomSelect[m
[32m+[m[32m                label="Category"[m
[32m+[m[32m                value={category}[m
[32m+[m[32m                onChange={setCategory}[m
[32m+[m[32m                options={CATEGORIES}[m
[32m+[m[32m             />[m
[32m+[m[32m          </div>[m
[32m+[m
[32m+[m[32m          <div className="relative z-[10] flex items-end">[m
[32m+[m[32m             <button[m
[32m+[m[32m                type="submit"[m
[32m+[m[32m                disabled={loading || !institute}[m
[32m+[m[32m                className="w-full py-3 h-[50px] bg-[#00AEEF] text-black font-bold rounded-xl hover:bg-[#00AEEF]/90 disabled:opacity-50 transition-all glow-blue"[m
[32m+[m[32m             >[m
[32m+[m[32m                {loading ? "Loading..." : "Analyze"}[m
[32m+[m[32m             </button>[m
[32m+[m[32m          </div>[m
         </form>[m
 [m
         {searched && data.length === 0 && ([m
[36m@@ -99,7 +127,7 @@[m [mexport default function TrendsPage() {[m
           <motion.div[m
             initial={{ opacity: 0, y: 20 }}[m
             animate={{ opacity: 1, y: 0 }}[m
[31m-            className="glass rounded-2xl p-6"[m
[32m+[m[32m            className="glass rounded-2xl p-6 relative z-10"[m
           >[m
             <ResponsiveContainer width="100%" height={400}>[m
               <LineChart data={data}>[m
[1mdiff --git a/frontend/lib/api.ts b/frontend/lib/api.ts[m
[1mindex a1714aa..adc9147 100644[m
[1m--- a/frontend/lib/api.ts[m
[1m+++ b/frontend/lib/api.ts[m
[36m@@ -1,20 +1,23 @@[m
[31m-const BASE = process.env.NEXT_PUBLIC_API_URL || "https://stunning-succotash-94j7j9qrqxwh6w6-8000.app.github.dev/"[m
[32m+[m[32mconst BASE = "https://josaa-predictor-api.vercel.app";[m
 [m
 export async function predict(params: Record<string, string | number>) {[m
   const qs = new URLSearchParams(params as Record<string, string>).toString()[m
   const res = await fetch(`${BASE}/api/predict?${qs}`)[m
[32m+[m[32m  if (!res.ok) throw new Error(`API error: ${res.status}`)[m
   return res.json()[m
 }[m
 [m
 export async function explore(params: Record<string, string | number>) {[m
   const qs = new URLSearchParams(params as Record<string, string>).toString()[m
   const res = await fetch(`${BASE}/api/explore?${qs}`)[m
[32m+[m[32m  if (!res.ok) throw new Error(`API error: ${res.status}`)[m
   return res.json()[m
 }[m
 [m
 export async function trends(params: Record<string, string>) {[m
   const qs = new URLSearchParams(params).toString()[m
   const res = await fetch(`${BASE}/api/trends?${qs}`)[m
[32m+[m[32m  if (!res.ok) throw new Error(`API error: ${res.status}`)[m
   return res.json()[m
 }[m
 [m
[36m@@ -25,6 +28,7 @@[m [mexport async function compare(institutes: string, program?: string, category?: s[m
     ...(category ? { category } : {}),[m
   }).toString()[m
   const res = await fetch(`${BASE}/api/compare?${qs}`)[m
[32m+[m[32m  if (!res.ok) throw new Error(`API error: ${res.status}`)[m
   return res.json()[m
 }[m
 [m
[36m@@ -34,5 +38,26 @@[m [mexport async function chat(message: string) {[m
     headers: { "Content-Type": "application/json" },[m
     body: JSON.stringify({ message }),[m
   })[m
[32m+[m[32m  if (!res.ok) throw new Error(`API error: ${res.status}`)[m
[32m+[m[32m  return res.json()[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mexport async function getInstitutes(program?: string) {[m
[32m+[m[32m  let url = `${BASE}/api/institutes`[m
[32m+[m[32m  if (program && program !== "ALL") {[m
[32m+[m[32m    url += `?program=${encodeURIComponent(program)}`[m
[32m+[m[32m  }[m
[32m+[m[32m  const res = await fetch(url)[m
[32m+[m[32m  if (!res.ok) throw new Error(`API error: ${res.status}`)[m
[32m+[m[32m  return res.json()[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mexport async function getPrograms(institute?: string) {[m
[32m+[m[32m  let url = `${BASE}/api/programs`[m
[32m+[m[32m  if (institute) {[m
[32m+[m[32m    url += `?institute=${encodeURIComponent(institute)}`[m
[32m+[m[32m  }[m
[32m+[m[32m  const res = await fetch(url)[m
[32m+[m[32m  if (!res.ok) throw new Error(`API error:${res.status}`)[m
   return res.json()[m
 }[m
\ No newline at end of file[m
