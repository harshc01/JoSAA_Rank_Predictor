"use client";

import { useState, useEffect } from "react";
import Autocomplete from "@/components/ui/Autocomplete";
import CustomSelect from "@/components/ui/CustomSelect";
import { compare, getInstitutes, getPrograms } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ComparePage() {
  const [instituteList, setInstituteList] = useState<string[]>([]);
  const [programList, setProgramList] = useState<string[]>([]);
  const [inst1, setInst1] = useState("");
  const [inst2, setInst2] = useState("");
  const [program, setProgram] = useState("ALL");
  const [category, setCategory] = useState("OPEN");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    getInstitutes().then((res) => { if (res.data) setInstituteList(res.data); });
    getPrograms().then((res) => {
        if (res.data) setProgramList(["ALL", ...res.data]); 
    });
  }, []);

  const handleCompare = async () => {
    if (!inst1 || !inst2) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await compare(`${inst1},${inst2}`, program, category);
      const formattedData = [1, 2, 3, 4, 5, 6].map((r) => ({ name: `R${r}` }));
      const k1 = inst1.toLowerCase();
      const k2 = inst2.toLowerCase();

      res.data.forEach((item: any) => {
        const rIdx = item.round - 1;
        if (rIdx >= 0 && rIdx <= 5) {
          const itemInst = item.institute.toLowerCase();
          if (itemInst.includes(k1)) formattedData[rIdx][k1] = item.closing_rank;
          else if (itemInst.includes(k2)) formattedData[rIdx][k2] = item.closing_rank;
        }
      });
      setChartData(formattedData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 pt-24 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Comparison Tool</h1>
          <p className="text-slate-400">Side-by-side analysis of institute closing ranks.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-50">
            <Autocomplete options={instituteList} value={inst1} onChange={setInst1} placeholder="Institute 1" />
            <Autocomplete options={instituteList} value={inst2} onChange={setInst2} placeholder="Institute 2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-40">
            <Autocomplete options={programList} value={program} onChange={setProgram} placeholder="Branch (or ALL)" />
            <CustomSelect 
                value={category} 
                onChange={setCategory} 
                options={["OPEN", "OBC-NCL", "SC", "ST", "EWS"]} 
            />
          </div>

          <button
            onClick={handleCompare}
            disabled={loading || !inst1 || !inst2}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg rounded-xl transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Compare Institutes"}
          </button>
        </div>

        {hasSearched && chartData.length > 0 && (
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl h-[600px] relative z-10">
            <h2 className="text-xl font-bold text-white mb-6">Closing Rank Comparison by Round</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis reversed stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ paddingTop: '30px' }} />
                <Bar dataKey={inst1.toLowerCase()} fill="#06b6d4" name={inst1} radius={[6, 6, 0, 0]} />
                <Bar dataKey={inst2.toLowerCase()} fill="#ec4899" name={inst2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}