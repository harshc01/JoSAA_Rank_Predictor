"use client";

import { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export default function CustomSelect({ label, value, onChange, options }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close the dropdown if the user clicks anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={wrapperRef}>
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      {/* The Closed Box (Acts as the trigger) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-900/60 border rounded-xl px-4 py-3 text-slate-200 cursor-pointer backdrop-blur-sm flex justify-between items-center transition-all ${
          isOpen ? "border-cyan-500/50 ring-1 ring-cyan-500/30" : "border-slate-700/50 hover:border-cyan-500/30"
        }`}
      >
        <span className="truncate">{value || "Select..."}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* The Open Dropdown Menu */}
      {isOpen && (
        <ul className="absolute top-[calc(100%+8px)] left-0 w-full z-[100] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar border-t-cyan-500/20">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-slate-800/50 last:border-0 ${
                value === opt
                  ? "bg-cyan-500/20 text-cyan-400 font-medium" // Highlight selected option
                  : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400" // Standard options
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}