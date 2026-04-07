export interface Allotment {
  id: number
  institute: string
  program: string
  quota: string
  category: string
  gender: string
  opening_rank: string
  closing_rank: string
  round: number
  chance?: "safe" | "target" | "dream"
}

export interface PredictParams {
  rank: number
  category: string
  gender: string
  quota?: string
  round?: number
}

export interface TrendPoint {
  round: string
  opening: number
  closing: number
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}