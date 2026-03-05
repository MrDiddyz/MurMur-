function calculateStyleScore(text, avatar) {
  let score = 100
  const lowerText = text.toLowerCase()

  avatar.voice.dontSay.forEach((phrase) => {
    if (lowerText.includes(phrase.toLowerCase())) score -= 20
  })

  ;(avatar.voice.bannedPhrases || []).forEach((phrase) => {
    if (lowerText.includes(phrase.toLowerCase())) score -= 30
  })

  if (avatar.voice.styleRules.formatting.preferBullets) {
    const hasBullets = text.includes("•") || text.includes("- ")
    if (!hasBullets) score -= 5
  }

  if (avatar.voice.styleRules.formatting.avoidLongParagraphs) {
    const longParagraph = text.split("\n\n").some((p) => p.length > 500)
    if (longParagraph) score -= 10
  }

  if (text.length > 1200) score -= 5
  if (text.includes("!!!")) score -= 10

  return Math.max(0, Math.min(100, score))
}

function brandGate(text, avatar) {
  const score = calculateStyleScore(text, avatar)

  if (score < avatar.quality.styleScore.minimum) {
    return {
      pass: false,
      reason: "Style score below minimum threshold",
      score
    }
  }

  return { pass: true, score }
}

const avatar = {
  voice: {
    dontSay: ["trust me", "hype"],
    bannedPhrases: ["sitt tight"],
    styleRules: {
      formatting: {
        preferBullets: true,
        preferNumberedPlans: true,
        avoidLongParagraphs: true,
        useHeadings: true
      }
    }
  },
  quality: {
    styleScore: {
      minimum: 85,
      target: 90
    }
  }
}

const sample = `Plan:\n• Punkt 1\n• Punkt 2`;
const result = brandGate(sample, avatar)
if (!result.pass) {
  console.error("Smoke test failed:", result)
  process.exit(1)
}

console.log("Style smoke test passed:", result)
