export type AvatarCore = {
  voice: {
    dontSay: string[]
    bannedPhrases?: string[]
    styleRules: {
      formatting: {
        preferBullets: boolean
        preferNumberedPlans: boolean
        avoidLongParagraphs: boolean
        useHeadings: boolean
      }
    }
  }
  quality: {
    styleScore: {
      minimum: number
      target: number
    }
  }
}
