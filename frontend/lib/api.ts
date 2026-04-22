const BASE = "https://josaa-predictor-api.vercel.app";

export async function predict(params: Record<string, string | number>) {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`${BASE}/api/predict?${qs}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function explore(params: Record<string, string | number>) {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`${BASE}/api/explore?${qs}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function trends(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/api/trends?${qs}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function compare(institutes: string, program?: string, category?: string) {
  const qs = new URLSearchParams({
    institutes,
    ...(program ? { program } : {}),
    ...(category ? { category } : {}),
  }).toString()
  const res = await fetch(`${BASE}/api/compare?${qs}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function chat(message: string) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function getInstitutes(program?: string) {
  let url = `${BASE}/api/institutes`
  if (program && program !== "ALL") {
    url += `?program=${encodeURIComponent(program)}`
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function getPrograms(institute?: string) {
  let url = `${BASE}/api/programs`
  if (institute) {
    url += `?institute=${encodeURIComponent(institute)}`
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error:${res.status}`)
  return res.json()
}