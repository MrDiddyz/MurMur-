import { calculateStyleScore } from "../shared/scoring"
import { AvatarCore } from "../../avatar-core/types"

export function brandGate(text: string, avatar: AvatarCore) {
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
