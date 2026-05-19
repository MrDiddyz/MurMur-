export type Severity = "Low" | "Medium" | "High";

export type ScanIssue = {
  id: string;
  issue: string;
  severity: Severity;
  revenueImpact: string;
  fixDifficulty: "Easy" | "Moderate" | "Hard";
  confidenceScore: number;
  suggestedAction: string;
  salesAngle: string;
};

export type ScanInput = {
  businessName: string;
  websiteUrl: string;
  facebookUrl: string;
  googleBusinessProfileUrl: string;
  industry: string;
  location: string;
  mainOffer: string;
};

export const mockScanInput: ScanInput = {
  businessName: "Nordlys Tannklinikk",
  websiteUrl: "https://nordlystann.no",
  facebookUrl: "https://facebook.com/nordlystann",
  googleBusinessProfileUrl: "https://maps.google.com/?cid=1234567890",
  industry: "Dental Clinic",
  location: "Oslo, Norway",
  mainOffer: "Invisalign and emergency dental appointments",
};

export const mockScores = {
  visibility: 46,
  trust: 58,
  conversion: 41,
  opportunity: 84,
};

export const mockIssues: ScanIssue[] = [
  {
    id: "seo-weakness",
    issue: "SEO weakness",
    severity: "High",
    revenueImpact: "Estimated 18-25% missed organic lead volume monthly.",
    fixDifficulty: "Moderate",
    confidenceScore: 89,
    suggestedAction: "Rebuild service pages around intent clusters and internal linking.",
    salesAngle: "Recover hidden demand already searching for your core services.",
  },
  {
    id: "inactive-facebook",
    issue: "Dead/inactive Facebook page",
    severity: "Medium",
    revenueImpact: "Lower social proof and weaker remarketing audience growth.",
    fixDifficulty: "Easy",
    confidenceScore: 78,
    suggestedAction: "Launch a 30-day trust-content cadence and automate reposting.",
    salesAngle: "Re-activate audience trust where prospects sanity-check providers.",
  },
  {
    id: "missing-cta",
    issue: "Missing CTA",
    severity: "High",
    revenueImpact: "High drop-off from visitors with intent but no clear next step.",
    fixDifficulty: "Easy",
    confidenceScore: 94,
    suggestedAction: "Add above-the-fold book-now CTA and sticky mobile action button.",
    salesAngle: "Turn passive traffic into booked consultations immediately.",
  },
  {
    id: "weak-google-reviews",
    issue: "Weak Google reviews",
    severity: "Medium",
    revenueImpact: "Lower map-pack conversion versus local competitors.",
    fixDifficulty: "Moderate",
    confidenceScore: 82,
    suggestedAction: "Implement automated review-request follow-up sequence post-visit.",
    salesAngle: "Lift trust quickly with compounding review velocity.",
  },
  {
    id: "missing-content",
    issue: "Missing content",
    severity: "High",
    revenueImpact: "Insufficient authority signals on high-value procedures.",
    fixDifficulty: "Hard",
    confidenceScore: 76,
    suggestedAction: "Deploy educational content pillar with FAQ snippets and cases.",
    salesAngle: "Own high-intent questions before prospects contact competitors.",
  },
  {
    id: "slow-website",
    issue: "Slow website",
    severity: "Medium",
    revenueImpact: "Higher abandonment from mobile paid/organic traffic.",
    fixDifficulty: "Moderate",
    confidenceScore: 86,
    suggestedAction: "Optimize image payloads, scripts, and caching strategy.",
    salesAngle: "Improve conversion by removing friction in first 3 seconds.",
  },
  {
    id: "missing-schema",
    issue: "Missing structured data/schema",
    severity: "Medium",
    revenueImpact: "Reduced rich-result visibility and weaker SERP differentiation.",
    fixDifficulty: "Easy",
    confidenceScore: 88,
    suggestedAction: "Add LocalBusiness, FAQ, and Review schema markup.",
    salesAngle: "Increase click-through without increasing ad spend.",
  },
  {
    id: "weak-trust",
    issue: "Weak trust signals",
    severity: "High",
    revenueImpact: "Prospects hesitate due to unclear credentials and proof.",
    fixDifficulty: "Easy",
    confidenceScore: 90,
    suggestedAction: "Surface certifications, before/after cases, and guarantees.",
    salesAngle: "Shorten decision time with immediate credibility cues.",
  },
  {
    id: "poor-mobile",
    issue: "Poor mobile experience",
    severity: "High",
    revenueImpact: "Major leakage from majority-mobile local discovery traffic.",
    fixDifficulty: "Moderate",
    confidenceScore: 91,
    suggestedAction: "Refactor mobile layout, tap targets, and booking interactions.",
    salesAngle: "Capture mobile intent currently leaking to faster competitors.",
  },
  {
    id: "no-lead-capture",
    issue: "No lead capture",
    severity: "High",
    revenueImpact: "No recovery path for non-booking visitors.",
    fixDifficulty: "Easy",
    confidenceScore: 93,
    suggestedAction: "Install lead magnet + callback form + abandoned-visit retargeting.",
    salesAngle: "Build a follow-up engine that monetizes unconverted traffic.",
  },
];
