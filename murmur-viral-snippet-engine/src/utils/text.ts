export function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
}

export function short(text: string, max = 44): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
