import { AvatarCore } from "../../avatar-core/types"

export function calculateStyleScore(
  text: string,
  avatar: AvatarCore
): number {
  let score = 100
  const lowerText = text.toLowerCase()

  // 1. Banned phrases (hard penalty)
  avatar.voice.dontSay.forEach((phrase) => {
    if (lowerText.includes(phrase.toLowerCase())) {
      score -= 20
    }
  })

  avatar.voice.bannedPhrases?.forEach((phrase) => {
    if (lowerText.includes(phrase.toLowerCase())) {
      score -= 30
    }
  })

  // 2. Structure preference
  if (avatar.voice.styleRules.formatting.preferBullets) {
    const hasBullets = text.includes("•") || text.includes("- ")
    if (!hasBullets) score -= 5
  }

  if (avatar.voice.styleRules.formatting.avoidLongParagraphs) {
    const longParagraph = text.split("\n\n").some((p) => p.length > 500)
    if (longParagraph) score -= 10
  }

  // 3. Tone heuristics (simple but effective)
  if (text.length > 1200) score -= 5
  if (text.includes("!!!")) score -= 10

  // Clamp
  return Math.max(0, Math.min(100, score))
}
