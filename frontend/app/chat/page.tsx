"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { chat } from "@/lib/api"
import { ChatMessage } from "@/lib/types"
import Footer from "@/components/layout/Footer"

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your JoSAA AI assistant. Ask me anything about college cutoffs, rank ranges, or seat allotments. For example: \"What is the CSE cutoff at IIT Bombay?\"",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const data = await chat(userMessage)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "Sorry, I couldn't process that." },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ])
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen pt-24 px-6 max-w-4xl mx-auto flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        <h1 className="text-4xl font-black mb-2">AI Chat</h1>
        <p className="text-gray-400 mb-8">
          Ask anything about JoSAA 2025 data in plain English.
        </p>

        <div className="glass rounded-2xl flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#00AEEF] text-black font-medium"
                        : "glass border border-white/10 text-gray-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="glass border border-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#00AEEF]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/5 p-4">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cutoffs, colleges, branches..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3
                           text-white placeholder-gray-500 focus:border-[#00AEEF]/50
                           focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-[#00AEEF] text-black font-bold rounded-xl
                           hover:bg-[#00AEEF]/90 disabled:opacity-50 transition-all glow-blue"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </motion.div>
      <Footer />
    </main>
  )
}