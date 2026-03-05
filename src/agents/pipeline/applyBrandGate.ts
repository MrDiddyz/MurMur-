import { AvatarCore } from "../../avatar-core/types"
import { brandGate } from "../gates/brandGate"

type GeneratedContent = {
  text: string
}

type GenerateContent = (opts?: { tighten?: boolean }) => GeneratedContent

export function generateWithBrandGate(
  avatar: AvatarCore,
  generateContent: GenerateContent
): GeneratedContent {
  const result = generateContent()
  const gate = brandGate(result.text, avatar)

  if (!gate.pass) {
    const retry = generateContent({ tighten: true })
    return retry
  }

  return result
}
