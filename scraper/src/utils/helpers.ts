export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function parseIndianNumber(text: string): number {
  const cleaned = text.replace(/[^0-9.-]/g, '');
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
}

export function parseIndianCurrency(text: string): number {
  // Handle Lakhs and Crores
  const normalized = text.toLowerCase();
  let multiplier = 1;
  
  if (normalized.includes('crore') || normalized.includes('cr')) {
    multiplier = 10000000;
  } else if (normalized.includes('lakh') || normalized.includes('lac')) {
    multiplier = 100000;
  }
  
  const number = parseIndianNumber(text);
  return number * multiplier;
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Handle DD/MM/YYYY format
  const ddmmyyyy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (ddmmyyyy) {
    return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`);
  }
  
  // Handle DD-MM-YYYY format
  const ddmmyyyy2 = dateStr.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (ddmmyyyy2) {
    return new Date(`${ddmmyyyy2[3]}-${ddmmyyyy2[2].padStart(2, '0')}-${ddmmyyyy2[1].padStart(2, '0')}`);
  }
  
  // Try default parsing
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

export function sanitizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\u0900-\u097F]/g, '') // Keep ASCII and Devanagari
    .trim();
}

export function extractPincode(address: string): string | null {
  const match = address.match(/\b\d{6}\b/);
  return match ? match[0] : null;
}