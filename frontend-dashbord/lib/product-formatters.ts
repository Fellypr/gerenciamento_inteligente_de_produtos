export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".")
  return parseFloat(cleaned) || 0
}

export function formatBarcode(value: string): string {
  return value.replace(/\D/g, "")
}

export function isValidUrl(url: string): boolean {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidBarcode(code: string): boolean {
  return /^\d+$/.test(code)
}

export function formatQuantity(value: string): number {
  return parseInt(value.replace(/\D/g, ""), 10) || 0
}
