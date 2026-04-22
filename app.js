const generateBtn = document.getElementById("generateBtn");
const remixBtn = document.getElementById("remixBtn");
const copyBtn = document.getElementById("copyBtn");
const promptOutput = document.getElementById("promptOutput");
const status = document.getElementById("status");

const REQUEST_TIMEOUT_MS = 15000;
let currentPrompt = "";
let isBusy = false;

function setStatus(message) {
  status.textContent = message;
}

function setReady(prompt) {
  currentPrompt = prompt;
  promptOutput.value = prompt;
  remixBtn.disabled = false;
  copyBtn.disabled = false;
}

function setBusy(busy) {
  isBusy = busy;
  generateBtn.disabled = busy;
  remixBtn.disabled = busy || !currentPrompt;
  copyBtn.disabled = busy || !currentPrompt;
}

async function requestPrompt(seedPrompt = "") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seedPrompt }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    const data = await response.json();
    if (!data || typeof data.prompt !== "string" || !data.prompt.trim()) {
      throw new Error("Invalid response payload");
    }

    return data.prompt.trim();
  } finally {
    clearTimeout(timeout);
  }
}

async function writeToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  promptOutput.removeAttribute("readonly");
  promptOutput.focus();
  promptOutput.select();

  const copied = document.execCommand("copy");
  promptOutput.setAttribute("readonly", "readonly");
  promptOutput.setSelectionRange(0, 0);

  if (!copied) {
    throw new Error("Clipboard not available");
  }
}

async function handleGenerate(seedPrompt = "") {
  if (isBusy) {
    return;
  }

  try {
    setBusy(true);
    setStatus(seedPrompt ? "Remixing prompt..." : "Generating prompt...");
    const prompt = await requestPrompt(seedPrompt);
    setReady(prompt);
    setStatus(seedPrompt ? "Prompt remixed." : "Prompt generated.");
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    setStatus(timedOut ? "Request timed out. Please try again." : "Could not generate prompt. Try again.");
  } finally {
    setBusy(false);
  }
}

generateBtn.addEventListener("click", async () => {
  await handleGenerate();
});

remixBtn.addEventListener("click", async () => {
  if (!currentPrompt) {
    return;
  }

  await handleGenerate(currentPrompt);
});

copyBtn.addEventListener("click", async () => {
  if (!currentPrompt || isBusy) {
    return;
  }

  try {
    await writeToClipboard(currentPrompt);
    setStatus("Prompt copied to clipboard.");
  } catch {
    setStatus("Clipboard access failed. Copy manually.");
  }
});

setStatus("Ready to generate your first prompt.");
