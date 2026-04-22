"use client";

import { useState, useEffect, useRef } from "react";

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function Autocomplete({ options, value, onChange, placeholder = "Search..." }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // tried a basic character logic l0l
  const showDropdown = isOpen && searchTerm.length >= 2 && filteredOptions.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full z-50">
      <input
        type="text"
        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder:text-slate-500 backdrop-blur-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          onChange(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {showDropdown && (
        <ul className="absolute z-50 w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar border-t-cyan-500/20">
          {filteredOptions.map((option) => (
            <li
              key={option}
              className="px-4 py-2.5 text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer transition-colors border-b border-slate-800/50 last:border-0"
              onClick={() => {
                setSearchTerm(option);
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}