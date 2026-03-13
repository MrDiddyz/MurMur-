"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function chunkText(value: string, maxCharsPerLine: number, maxLines: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      lines.push(word.slice(0, maxCharsPerLine));
      currentLine = word.slice(maxCharsPerLine);
    }

    if (lines.length >= maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines);
}

function createCardSvg(title: string, preview: string) {
  const safeTitle = escapeXml(title || "Untitled Prompt");
  const previewLines = chunkText(preview || "No preview yet.", 42, 5).map(escapeXml);

  const previewTspans = previewLines
    .map((line, index) => `<tspan x="64" dy="${index === 0 ? 0 : 42}">${line}</tspan>`)
    .join("");

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" rx="36" />
  <rect x="40" y="40" width="1120" height="550" rx="26" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
  <text x="64" y="130" fill="#bfdbfe" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600">Prompt title</text>
  <text x="64" y="188" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="700">${safeTitle}</text>
  <text x="64" y="278" fill="#dbeafe" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600">Prompt preview</text>
  <text x="64" y="332" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="500" dominant-baseline="hanging">${previewTspans}</text>
  <text x="64" y="570" fill="#bfdbfe" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="600">Generated with MurMur</text>
</svg>`;
}

export function ShareCardGenerator() {
  const [topic, setTopic] = useState("");
  const [promptTitle, setPromptTitle] = useState("");
  const [promptPreview, setPromptPreview] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const cardDataUrl = useMemo(() => {
    if (!hasGenerated) {
      return "";
    }

    const svg = createCardSvg(promptTitle, promptPreview);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [hasGenerated, promptPreview, promptTitle]);

  const shareText = encodeURIComponent(
    `${promptTitle}\n\n${promptPreview}\n\nGenerated with MurMur`,
  );

  const onGenerate = () => {
    const base = topic.trim() || "Creative Systems Thinking";
    const generatedTitle = `Prompt: ${base}`;
    const generatedPreview = `Design a practical framework for ${base.toLowerCase()} using first-principles reasoning, constraints, and two concrete execution steps.`;

    setPromptTitle(generatedTitle);
    setPromptPreview(generatedPreview);
    setHasGenerated(true);
  };

  return (
    <section className="rounded-2xl border border-[#d8c7ad] bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#826443]">Prompt Studio</p>
        <h2 className="text-2xl font-semibold text-[#1f1f1f]">Share Card Generator</h2>
        <p className="text-sm text-[#3c3329]">Generate a prompt and instantly turn it into a shareable image card.</p>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="rounded-lg border border-[#d8c7ad] px-4 py-2 text-sm outline-none ring-[#826443] focus:ring"
            placeholder="Enter a topic for your prompt"
          />
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-lg bg-[#1f1b16] px-4 py-2 text-sm font-semibold text-[#f5efe6]"
          >
            Generate prompt
          </button>
        </div>

        {hasGenerated ? (
          <div className="space-y-4 rounded-xl border border-[#d8c7ad] bg-[#f8f5ef] p-4">
            <Image src={cardDataUrl} alt="Generated share card" width={1200} height={630} className="w-full rounded-xl border border-[#d8c7ad]" unoptimized />

            <div className="flex flex-wrap gap-2">
              <a
                href={`https://x.com/intent/post?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[#1f1b16] px-3 py-2 text-sm font-semibold text-[#1f1b16]"
              >
                Share to X
              </a>
              <a
                href={`https://www.reddit.com/submit?title=${encodeURIComponent(promptTitle)}&text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[#1f1b16] px-3 py-2 text-sm font-semibold text-[#1f1b16]"
              >
                Share to Reddit
              </a>
              <a
                href={cardDataUrl}
                download="murmur-share-card.svg"
                className="rounded-md bg-[#1f1b16] px-3 py-2 text-sm font-semibold text-[#f5efe6]"
              >
                Download image
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
