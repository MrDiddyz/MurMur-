import { PipelineInput } from "./types";

const MAX_ARTICLES = 200;
const MAX_TEXT_LENGTH = 12_000;

export function validatePipelineInput(input: PipelineInput): PipelineInput {
  if (!Array.isArray(input.articles) || input.articles.length === 0) {
    throw new Error("Input must include at least one article.");
  }

  if (input.articles.length > MAX_ARTICLES) {
    throw new Error(`Input exceeds max articles (${MAX_ARTICLES}).`);
  }

  input.articles.forEach((article, idx) => {
    if (!article.title?.trim()) {
      throw new Error(`Article ${idx} is missing title.`);
    }

    if (!article.body?.trim()) {
      throw new Error(`Article ${idx} is missing body.`);
    }

    if (article.body.length > MAX_TEXT_LENGTH) {
      throw new Error(`Article ${idx} body exceeds ${MAX_TEXT_LENGTH} chars.`);
    }
  });

  return input;
}
