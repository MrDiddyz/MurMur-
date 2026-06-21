export type WebsiteBrief = {
  siteName?: string;
  primaryObjective?: string;
  targetAudience?: string;
  pages?: string[];
  brandVoice?: string;
  keyFeatures?: string[];
  seoKeywords?: string[];
  primaryCallToAction?: string;
};

export type PromptInput = {
  goal: string;
  context?: string;
  constraints?: string[];
  website?: WebsiteBrief;
};

export type PromptGeneratorMode = "template" | "api";

export type PromptApiClient = (input: PromptInput) => Promise<string>;

export type GeneratePromptOptions = {
  mode?: PromptGeneratorMode;
  apiClient?: PromptApiClient;
};

interface PromptGenerator {
  generate(input: PromptInput): Promise<string>;
}

class TemplatePromptGenerator implements PromptGenerator {
  async generate(input: PromptInput): Promise<string> {
    return buildTemplatePrompt(input);
  }
}

class ApiPromptGenerator implements PromptGenerator {
  constructor(
    private readonly apiClient: PromptApiClient | undefined,
    private readonly fallbackGenerator: PromptGenerator
  ) {}

  async generate(input: PromptInput): Promise<string> {
    if (!this.apiClient) {
      return this.fallbackGenerator.generate(input);
    }

    return this.apiClient(input);
  }
}

function createPromptGenerator(options: GeneratePromptOptions): PromptGenerator {
  const templateGenerator = new TemplatePromptGenerator();

  switch (options.mode) {
    case "api":
      return new ApiPromptGenerator(options.apiClient, templateGenerator);
    case "template":
    default:
      return templateGenerator;
  }
}

function asNumberedList(items: string[], emptyState: string): string {
  const normalized = items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => `${index + 1}. ${item}`);

  return normalized.length ? normalized.join("\n") : emptyState;
}

function validatePromptInput(input: PromptInput): void {
  if (!input.goal || !input.goal.trim()) {
    throw new Error("Prompt goal is required.");
  }
}

function buildTemplatePrompt({ goal, context, constraints = [], website }: PromptInput): string {
  const contextSection = context?.trim() ? context.trim() : "No additional project context provided.";
  const constraintsSection = asNumberedList(constraints, "No hard constraints provided.");
  const pagesSection = asNumberedList(
    website?.pages ?? [],
    "1. Home\n2. About\n3. Services\n4. Contact"
  );
  const featuresSection = asNumberedList(
    website?.keyFeatures ?? [],
    "No specific feature list provided."
  );
  const keywordsSection = asNumberedList(
    website?.seoKeywords ?? [],
    "No SEO keywords provided."
  );

  return [
    "You are a senior web strategist and UX planner.",
    "Create a strong, well-structured website plan from the brief below.",
    "",
    "## Project Goal",
    goal.trim(),
    "",
    "## Project Context",
    contextSection,
    "",
    "## Website Brief",
    `- Site name: ${website?.siteName?.trim() || "Not specified"}`,
    `- Primary objective: ${website?.primaryObjective?.trim() || "Not specified"}`,
    `- Target audience: ${website?.targetAudience?.trim() || "Not specified"}`,
    `- Brand voice: ${website?.brandVoice?.trim() || "Not specified"}`,
    `- Primary CTA: ${website?.primaryCallToAction?.trim() || "Not specified"}`,
    "",
    "## Suggested Site Structure (Pages)",
    pagesSection,
    "",
    "## Functional Requirements",
    featuresSection,
    "",
    "## Constraints",
    constraintsSection,
    "",
    "## SEO Focus",
    keywordsSection,
    "",
    "## Output Format",
    "Return a structured website plan with:",
    "1. Sitemap",
    "2. Page-by-page content outline",
    "3. UX/UI recommendations",
    "4. Conversion and CTA strategy",
    "5. Technical implementation notes",
    "6. SEO recommendations",
  ].join("\n");
}

export async function generatePrompt(
  input: PromptInput,
  options: GeneratePromptOptions = {}
): Promise<string> {
  validatePromptInput(input);

  const generator = createPromptGenerator(options);
  return generator.generate(input);
}
