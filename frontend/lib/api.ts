const BASE = process.env.NEXT_PUBLIC_API_URL || "https://stunning-succotash-94j7j9qrqxwh6w6-8000.app.github.dev/"

export async function predict(params: Record<string, string | number>) {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`${BASE}/api/predict?${qs}`)
  return res.json()
}

export async function explore(params: Record<string, string | number>) {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`${BASE}/api/explore?${qs}`)
  return res.json()
}

export async function trends(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/api/trends?${qs}`)
  return res.json()
}

export async function compare(institutes: string, program?: string, category?: string) {
  const qs = new URLSearchParams({
    institutes,
    ...(program ? { program } : {}),
    ...(category ? { category } : {}),
  }).toString()
  const res = await fetch(`${BASE}/api/compare?${qs}`)
  return res.json()
}

export async function chat(message: string) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
  return res.json()
}