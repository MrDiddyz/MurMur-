const API_BASE = "http://localhost:7070";

const runButton = document.getElementById("runPipeline");
const latestReportEl = document.getElementById("latestReport");
const narrativesEl = document.getElementById("narratives");
const signalsEl = document.getElementById("signals");

const demoPayload = {
  correlationId: `corr-demo-${Date.now()}`,
  source: { name: "demo-feed", kind: "manual" },
  articles: [
    {
      title: "AI copilots move into legal workflows",
      body: "AI copilots show growth in legal ops while teams watch risk and compliance signals.",
    },
    {
      title: "Creator economy shifts to smaller communities",
      body: "Creators report strong engagement growth in niche communities with repeated demand for authenticity.",
    },
  ],
};

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function renderList(el, items, formatter) {
  el.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = formatter(item);
    el.appendChild(card);
  });
}

async function refresh() {
  const [{ reports }, { narratives }, { signals }, { stats }] = await Promise.all([
    fetchJson(`${API_BASE}/api/reports`),
    fetchJson(`${API_BASE}/api/narratives`),
    fetchJson(`${API_BASE}/api/signals`),
    fetchJson(`${API_BASE}/api/feedback/stats`),
  ]);

  latestReportEl.textContent = reports[0]
    ? `${reports[0].summary}\n\nWhat matters now: ${reports[0].whatMattersNow}`
    : "No reports yet.";

  renderList(
    narrativesEl,
    narratives.slice(0, 5),
    (n) => {
      const learned = stats?.[n.theme]?.avgScore;
      return `<strong>${n.title}</strong><br/>confidence: ${(n.confidence * 100).toFixed(1)}%<br/>learned score: ${learned ? learned.toFixed(2) : "n/a"}`;
    },
  );

  renderList(signalsEl, signals.slice(0, 8), (s) => {
    return `<strong>${s.emotionalTone}</strong><br/>trends: ${s.trendKeywords.join(", ")}<br/>anomalies: ${s.anomalyFlags.join(", ") || "none"}`;
  });
}

runButton.addEventListener("click", async () => {
  runButton.disabled = true;
  try {
    await fetchJson(`${API_BASE}/api/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(demoPayload),
    });
    await refresh();
  } finally {
    runButton.disabled = false;
  }
});

refresh().catch((error) => {
  latestReportEl.textContent = `Failed to load dashboard: ${error.message}`;
});
