import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JoSAA AI — Beyond Prediction. Total Domination.",
  description: "AI-powered JoSAA rank predictor and college explorer for JEE aspirants",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050812] text-white antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}