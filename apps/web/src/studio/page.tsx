import { useEffect, useMemo, useState } from "react";

type SceneCategory = "cinematic" | "music-video" | "editorial";

type AiProvider = "openai" | "anthropic" | "google" | "custom";

type SceneDraft = {
  title: string;
  mood: string;
  category: SceneCategory;
  duration: number;
  prompt: string;
  notes: string;
  collaborationNotes: string;
  provider: AiProvider;
  integrationEndpoint: string;
};

type SavedScene = SceneDraft & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

type SessionState = {
  userEmail: string;
  loginApproved: boolean;
  ageConfirmed: boolean;
  consentAccepted: boolean;
  policyChecks: boolean[];
  scene: SceneDraft;
  activeTab: OutputTab;
  savedScenes: SavedScene[];
  lastSavedAt: string | null;
};

const STORAGE_KEY = "murmur.studio.session.v2";

const DEFAULT_DRAFT: SceneDraft = {
  title: "Midnight Velvet",
  mood: "Luxury neon · slow motion",
  category: "cinematic",
  duration: 18,
  prompt: "A premium, low-key studio scene with gold accents, reflective floor and cinematic smoke.",
  notes: "Use soft diffusion, very controlled camera path and subtle bokeh.",
  collaborationNotes: "Team objective: final cut for cross-platform launch. Keep visuals policy-safe.",
  provider: "openai",
  integrationEndpoint: "https://api.murmur.ai/v1/render",
};

const POLICY_ITEMS = [
  "I confirm all participants are 18+.",
  "I will not upload illegal, exploitative or non-consensual content.",
  "I understand generated output may require manual review before publication.",
  "I agree to transparent AI usage disclosure for partners and clients.",
];

const OUTPUT_TABS = ["Preview", "Render Log", "Metadata", "Collab Feed"] as const;
type OutputTab = (typeof OUTPUT_TABS)[number];

const PROVIDER_LABELS: Record<AiProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google Gemini",
  custom: "Custom API",
};

const INITIAL_STATE: SessionState = {
  userEmail: "",
  loginApproved: false,
  ageConfirmed: false,
  consentAccepted: false,
  policyChecks: POLICY_ITEMS.map(() => false),
  scene: DEFAULT_DRAFT,
  activeTab: "Preview",
  savedScenes: [],
  lastSavedAt: null,
};

const isEmailValid = (value: string) => /.+@.+\..+/.test(value.trim());

const providerCapability = (provider: AiProvider) => {
  if (provider === "openai") return "Realtime + tool orchestration";
  if (provider === "anthropic") return "Long-context editorial planning";
  if (provider === "google") return "Cross-modal search and grounding";
  return "Partner-specific custom connector";
};

export function StudioPage() {
  const [password, setPassword] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "done">("idle");
  const [session, setSession] = useState<SessionState>(INITIAL_STATE);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<SessionState>;
      setSession((prev) => ({
        ...prev,
        ...parsed,
        policyChecks: Array.isArray(parsed.policyChecks) && parsed.policyChecks.length === POLICY_ITEMS.length
          ? parsed.policyChecks
          : prev.policyChecks,
        scene: {
          ...prev.scene,
          ...(parsed.scene ?? {}),
        },
      }));
    } catch {
      // Ignore malformed client-side state and continue with defaults.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Best effort persistence only.
    }
  }, [session]);

  useEffect(() => {
    if (copyStatus !== "done") return;
    const timer = window.setTimeout(() => setCopyStatus("idle"), 1500);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const allPoliciesChecked = session.policyChecks.every(Boolean);

  const readiness = useMemo(() => {
    const checks = [
      session.loginApproved,
      session.ageConfirmed,
      session.consentAccepted,
      allPoliciesChecked,
      session.scene.title.trim().length > 2,
      session.scene.prompt.trim().length > 20,
      session.scene.integrationEndpoint.startsWith("http"),
      session.scene.collaborationNotes.trim().length > 12,
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [session, allPoliciesChecked]);

  const renderToken = useMemo(() => {
    const base = `${session.scene.title}-${session.scene.category}-${session.scene.duration}`
      .replace(/\s+/g, "-")
      .toLowerCase();
    return `murmur_${base}_${readiness}`;
  }, [session.scene.title, session.scene.category, session.scene.duration, readiness]);

  const deploymentStatus = useMemo(() => {
    if (readiness >= 90) return "Production ready";
    if (readiness >= 70) return "Staging ready";
    return "Draft";
  }, [readiness]);

  const togglePolicy = (index: number) => {
    setSession((prev) => ({
      ...prev,
      policyChecks: prev.policyChecks.map((value, i) => (i === index ? !value : value)),
    }));
  };

  const updateScene = <K extends keyof SceneDraft>(field: K, value: SceneDraft[K]) => {
    setSession((prev) => ({ ...prev, scene: { ...prev.scene, [field]: value } }));
  };

  const saveScene = () => {
    const now = new Date().toISOString();
    setSession((prev) => {
      const existingIndex = prev.savedScenes.findIndex((item) => item.title === prev.scene.title);
      const entry: SavedScene = {
        ...prev.scene,
        id: existingIndex >= 0 ? prev.savedScenes[existingIndex].id : crypto.randomUUID(),
        createdAt: existingIndex >= 0 ? prev.savedScenes[existingIndex].createdAt : now,
        updatedAt: now,
      };

      const next = [...prev.savedScenes];
      if (existingIndex >= 0) {
        next[existingIndex] = entry;
      } else {
        next.unshift(entry);
      }

      return {
        ...prev,
        savedScenes: next.slice(0, 24),
        lastSavedAt: now,
      };
    });
  };

  const exportScene = () => {
    const payload = JSON.stringify(
      {
        scene: session.scene,
        renderToken,
        deploymentStatus,
        owner: session.userEmail,
      },
      null,
      2,
    );

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${session.scene.title.replace(/\s+/g, "-").toLowerCase() || "scene"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyShareBundle = async () => {
    const bundle = {
      title: session.scene.title,
      prompt: session.scene.prompt,
      provider: session.scene.provider,
      endpoint: session.scene.integrationEndpoint,
      token: renderToken,
      owner: session.userEmail,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
      setCopyStatus("done");
    } catch {
      setCopyStatus("idle");
    }
  };

  const logout = () => {
    setPassword("");
    setSession(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!session.loginApproved) {
    return (
      <main className="app-shell">
        <section className="card auth-card">
          <p className="eyebrow">MurMur Studio · Private Access</p>
          <h1>Logg inn</h1>
          <p className="muted">Lukket premium studio for ekte produksjon, AI-samarbeid og trygg publisering.</p>
          <label>
            E-post
            <input
              value={session.userEmail}
              onChange={(e) => setSession((prev) => ({ ...prev, userEmail: e.target.value }))}
              placeholder="creator@murmur.ai"
            />
          </label>
          <label>
            Passord
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          <button
            disabled={!isEmailValid(session.userEmail) || password.length < 6}
            onClick={() => setSession((prev) => ({ ...prev, loginApproved: true }))}
          >
            Enter Studio
          </button>
        </section>
      </main>
    );
  }

  if (!session.ageConfirmed) {
    return (
      <main className="app-shell">
        <section className="card gate-card">
          <p className="eyebrow">Age Gate</p>
          <h1>18+ Bekreftelse</h1>
          <p className="muted">Du må være minst 18 år for å bruke denne studio-opplevelsen.</p>
          <div className="actions-row">
            <button onClick={() => setSession((prev) => ({ ...prev, ageConfirmed: true }))}>Jeg er 18+</button>
            <button className="ghost" onClick={logout}>Avslutt</button>
          </div>
        </section>
      </main>
    );
  }

  if (!session.consentAccepted || !allPoliciesChecked) {
    return (
      <main className="app-shell">
        <section className="card gate-card">
          <p className="eyebrow">Policy & Consent Gate</p>
          <h1>Samtykke og retningslinjer</h1>
          <div className="policy-list">
            {POLICY_ITEMS.map((item, index) => (
              <label key={item} className="policy-item">
                <input type="checkbox" checked={session.policyChecks[index]} onChange={() => togglePolicy(index)} />
                {item}
              </label>
            ))}
          </div>
          <label className="policy-item">
            <input
              type="checkbox"
              checked={session.consentAccepted}
              onChange={() => setSession((prev) => ({ ...prev, consentAccepted: !prev.consentAccepted }))}
            />
            I consent to MurMur terms, privacy policy and safe use guidelines.
          </label>
          <button disabled={!allPoliciesChecked || !session.consentAccepted}>Fortsett til studio</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MurMur Premium Studio</p>
          <h1>Scene Builder Council</h1>
          <p className="muted">Deployment: {deploymentStatus}</p>
        </div>
        <div className="topbar-actions">
          <div className="pill">Readiness {readiness}%</div>
          <button className="ghost" onClick={logout}>Logg ut</button>
        </div>
      </header>

      <section className="workspace">
        <article className="card">
          <h2>Scene Builder</h2>
          <div className="form-grid">
            <label>
              Title
              <input value={session.scene.title} onChange={(e) => updateScene("title", e.target.value)} />
            </label>
            <label>
              Mood
              <input value={session.scene.mood} onChange={(e) => updateScene("mood", e.target.value)} />
            </label>
            <label>
              Category
              <select value={session.scene.category} onChange={(e) => updateScene("category", e.target.value as SceneCategory)}>
                <option value="cinematic">Cinematic</option>
                <option value="music-video">Music Video</option>
                <option value="editorial">Editorial</option>
              </select>
            </label>
            <label>
              Duration (sec)
              <input
                type="number"
                min={5}
                max={120}
                value={session.scene.duration}
                onChange={(e) => updateScene("duration", Number(e.target.value) || 5)}
              />
            </label>
          </div>

          <label>
            Prompt
            <textarea value={session.scene.prompt} onChange={(e) => updateScene("prompt", e.target.value)} rows={4} />
          </label>

          <label>
            Director Notes
            <textarea value={session.scene.notes} onChange={(e) => updateScene("notes", e.target.value)} rows={3} />
          </label>

          <div className="actions-row">
            <button onClick={saveScene}>Save to Library</button>
            <button className="ghost" onClick={exportScene}>Export JSON</button>
          </div>

          <p className="muted small">
            Sist lagret: {session.lastSavedAt ? new Date(session.lastSavedAt).toLocaleString() : "Aldri"}
          </p>
        </article>

        <article className="card">
          <h2>Output Tabs</h2>
          <div className="tabs-row">
            {OUTPUT_TABS.map((tab) => (
              <button
                key={tab}
                className={session.activeTab === tab ? "tab active" : "tab"}
                onClick={() => setSession((prev) => ({ ...prev, activeTab: tab }))}
              >
                {tab}
              </button>
            ))}
          </div>

          {session.activeTab === "Preview" && (
            <div className="output-box">
              <p className="muted">Realtime Preview</p>
              <p>{session.scene.prompt}</p>
              <p className="pill">Token: {renderToken}</p>
            </div>
          )}

          {session.activeTab === "Render Log" && (
            <div className="output-box mono">
              <p>[status] {deploymentStatus}</p>
              <p>[owner] {session.userEmail || "creator"}</p>
              <p>[scene] {session.scene.title}</p>
              <p>[render] prepared {session.scene.duration}s {session.scene.category} output</p>
              <p>[provider] {PROVIDER_LABELS[session.scene.provider]}</p>
            </div>
          )}

          {session.activeTab === "Metadata" && (
            <div className="output-box mono">
              <p>owner={session.userEmail || "creator"}</p>
              <p>mood={session.scene.mood}</p>
              <p>token={renderToken}</p>
              <p>notes_length={session.scene.notes.length}</p>
              <p>endpoint={session.scene.integrationEndpoint}</p>
            </div>
          )}

          {session.activeTab === "Collab Feed" && (
            <div className="output-box mono">
              <p>[council] AI collaboration active</p>
              <p>[ai] Provider capability: {providerCapability(session.scene.provider)}</p>
              <p>[ops] Endpoint health: {session.scene.integrationEndpoint.startsWith("http") ? "ok" : "invalid"}</p>
              <p>[team] {session.scene.collaborationNotes}</p>
            </div>
          )}
        </article>

        <article className="card">
          <h2>Library / Integrations</h2>
          <label>
            AI Provider
            <select value={session.scene.provider} onChange={(e) => updateScene("provider", e.target.value as AiProvider)}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google Gemini</option>
              <option value="custom">Custom API</option>
            </select>
          </label>

          <label>
            Integration Endpoint
            <input
              value={session.scene.integrationEndpoint}
              onChange={(e) => updateScene("integrationEndpoint", e.target.value)}
              placeholder="https://api.partner.com/render"
            />
          </label>

          <label>
            Collaboration Notes
            <textarea
              rows={3}
              value={session.scene.collaborationNotes}
              onChange={(e) => updateScene("collaborationNotes", e.target.value)}
            />
          </label>

          <div className="actions-row">
            <button className="ghost" onClick={copyShareBundle}>
              {copyStatus === "done" ? "Bundle copied" : "Copy share bundle"}
            </button>
          </div>

          <p className="muted small">Lagrede scener ({session.savedScenes.length})</p>
          <div className="library-list">
            {session.savedScenes.length === 0 && <p className="muted">Ingen scener lagret enda.</p>}
            {session.savedScenes.map((item) => (
              <button
                key={item.id}
                className="library-item"
                onClick={() => setSession((prev) => ({ ...prev, scene: item }))}
                title="Load scene"
              >
                <strong>{item.title}</strong>
                <span>{item.category}</span>
                <span>Oppdatert: {new Date(item.updatedAt).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
