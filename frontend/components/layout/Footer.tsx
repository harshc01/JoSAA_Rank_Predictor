import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xl font-bold text-white">
            JoSAA<span className="text-[#00AEEF]">AI</span>
          </span>
          <p className="text-gray-500 text-sm mt-1">
            Data sourced from JoSAA 2025 official records.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="/predict" className="hover:text-[#00AEEF] transition-colors">Predict</Link>
          <Link href="/explore" className="hover:text-[#00AEEF] transition-colors">Explorer</Link>
          <Link href="/trends" className="hover:text-[#00AEEF] transition-colors">Trends</Link>
          <Link href="/compare" className="hover:text-[#00AEEF] transition-colors">Compare</Link>
          <Link href="/chat" className="hover:text-[#00AEEF] transition-colors">AI Chat</Link>
        </div>
        <p className="text-gray-600 text-xs">
          Built by harshc01 · Not affiliated with JoSAA
        </p>
      </div>
    </footer>
  )
}