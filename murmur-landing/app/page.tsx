"use client";

// app/page.tsx
// MurMur Cosmic Portal v2 — Landing + Constellation Hero + Mock Demo + Trust + Pricing
// Next.js (App Router) + Tailwind
//
// Assumes you have Tailwind set up. No extra deps required.

import Link from "next/link";
import { useEffect, useRef } from "react";
import Constellation from "../components/Constellation";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0B0616] text-white">
      {/* Background: subtle grid + glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(rgba(230,193,90,0.10)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(230,193,90,0.18),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-64 right-[-120px] h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle_at_center,rgba(176,120,255,0.22),transparent_60%)] blur-3xl" />
      </div>

      <SiteHeader />

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 md:pb-16 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative">
            <Pill text="MURMUR • Constellation OS" />
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              Din egen agent-konstellasjon som jobber for deg — og blir bedre for
              hver uke.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg text-white/80 md:text-xl">
              Autonome AI-agenter som planlegger, utfører, evaluerer og justerer
              — med full sporbarhet, menneskelig kontroll og sikker drift.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#demo"
                className="inline-flex items-center justify-center rounded-xl bg-[#E6C15A] px-5 py-3 font-semibold text-[#0B0616] shadow-[0_0_0_1px_rgba(230,193,90,0.25),0_20px_60px_rgba(230,193,90,0.18)] transition hover:brightness-110"
              >
                Se live demo
                <span className="ml-2 text-sm">→</span>
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Få en agent i drift på 7 dager
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
              <Stat label="Sporbarhet" value="Plan → handling → resultat" />
              <Stat label="Kontroll" value="Terskler + kill-switch" />
              <Stat label="Læring" value="Måling → eksperiment → evaluering" />
            </div>
          </div>

          {/* Constellation animation */}
          <div className="relative">
            <Constellation />
          </div>
        </div>

        {/* quick feature row */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Speilende agenter"
            desc="Én bygger, én utfordrer, én verifiserer, én lærer — så du får kvalitet uten drama."
          />
          <FeatureCard
            title="Agent Replay"
            desc="Klikk «Hvorfor?» og se begrunnelse, steg, verktøy og resultat — alltid logget."
          />
          <FeatureCard
            title="Outcome-pakker"
            desc="Kjøp jobber, ikke buzzwords: Growth, Ops, Sales, Shop — ferdige moduler som leverer."
          />
        </div>
      </section>

      {/* DEMO */}
      <section
        id="demo"
        className="relative mx-auto max-w-6xl px-4 py-12 md:py-16"
      >
        <SectionHeading
          eyebrow="LIVE DEMO (mock)"
          title="Se agentene samarbeide — og hvorfor de gjorde det"
          subtitle="Mock først. Bytt senere til ekte agent-API via /api/run og /api/replay."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <DemoPanel />
          <TrustPanel />
        </div>
      </section>

      {/* PACKAGES */}
      <section className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <SectionHeading
          eyebrow="MODULER"
          title="Velg en konstellasjon som faktisk gjør en jobb"
          subtitle="Start enkelt. Legg til flere noder når signalet (KPI) er stabilt."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <ModuleCard
            title="Growth Constellation"
            bullets={[
              "3 posts/uke + hook-bibliotek",
              "CTR måling + læringslogg",
              "A/B-forslag med godkjenningsterskel",
            ]}
          />
          <ModuleCard
            title="Ops Constellation"
            bullets={[
              "Varsler + auto triage (mock)",
              "Runbooks + prioritering",
              "Sporbarhet for hvert tiltak",
            ]}
          />
          <ModuleCard
            title="Sales Constellation"
            bullets={[
              "Lead scoring + segmentering",
              "Outreach-utkast + oppfølging",
              "Kalender-klar møterekke (API senere)",
            ]}
          />
          <ModuleCard
            title="Shop Constellation"
            bullets={[
              "Listing-forslag + prising",
              "Kvalitetssjekk + risiko-merker",
              "Etterspørsel-signal (simulator senere)",
            ]}
          />
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="relative mx-auto max-w-6xl px-4 py-12 md:py-16"
      >
        <SectionHeading
          eyebrow="PRISING"
          title="Tre nivåer. Ett mål: mer output per uke."
          subtitle="Core-tilgang låses opp med en kort, ufarlig 15-min test (kvalitet + ansvar)."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <PriceCard
            tier="Starter"
            price="Fra 2 490/mnd"
            tag="1 konstellasjon"
            features={[
              "1 agent-pakke (Growth/Ops/Sales/Shop)",
              "Ukentlig læringsoppdatering",
              "Basis logging + replay",
            ]}
            cta="Start Starter"
            highlight={false}
          />
          <PriceCard
            tier="Pro"
            price="Fra 6 990/mnd"
            tag="Skaler output"
            features={[
              "2–4 konstellasjoner",
              "Eksperiment-motor + terskler",
              "Dashboards (MVP) + exports",
            ]}
            cta="Start Pro"
            highlight
          />
          <PriceCard
            tier="Core"
            price="Invite"
            tag="MurMur Core"
            features={[
              "Tilpasset agent-arkitektur",
              "Sikkerhetsprofil + audit",
              "Simulator/Think-Tank lag",
            ]}
            cta="Søk Core"
            highlight={false}
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <div>
            <div className="text-sm text-white/70">
              Kontakt:{" "}
              <a
                className="font-semibold text-[#E6C15A] hover:brightness-110"
                href="mailto:MurMurAi@proton.me"
              >
                MurMurAi@proton.me
              </a>
            </div>
            <div className="mt-2 text-xs text-white/50">
              © {new Date().getFullYear()} MurMur • Constellation
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#demo"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
            >
              Demo
            </a>
            <a
              href="#pricing"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
            >
              Prising
            </a>
            <a
              href="#"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
            >
              Personvern
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* --------------------------- UI Components --------------------------- */

function SiteHeader() {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const slider = nav.querySelector<HTMLElement>(".js-portfolio-nav-slider");
    const links = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>(".js-portfolio-nav-link"),
    );

    if (!slider || !links.length) return;

    const currentHash =
      (window.location.hash && links.find((link) => link.getAttribute("href") === window.location.hash)?.getAttribute("href")) ||
      "#demo";

    let activeLink =
      links.find((link) => link.getAttribute("href") === currentHash) ||
      links.find((link) => link.dataset.active === "true") ||
      links[0];

    links.forEach((link) => link.classList.remove("is-current"));
    activeLink.classList.add("is-current");

    const getMetrics = (element: Element) => {
      const navRect = nav.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - navRect.left,
        w: rect.width,
      };
    };

    const moveTo = (element: Element) => {
      const { x, w } = getMetrics(element);
      slider.style.transform = `translateX(${x}px)`;
      slider.style.width = `${w}px`;
    };

    moveTo(activeLink);

    const removeListeners = links.flatMap((link) => {
      const handleEnter = () => moveTo(link);
      const handleFocus = () => moveTo(link);
      const handleClick = () => {
        links.forEach((item) => item.classList.remove("is-current"));
        link.classList.add("is-current");
        activeLink = link;
        moveTo(link);
      };

      link.addEventListener("mouseenter", handleEnter);
      link.addEventListener("focus", handleFocus);
      link.addEventListener("click", handleClick);

      return [
        () => link.removeEventListener("mouseenter", handleEnter),
        () => link.removeEventListener("focus", handleFocus),
        () => link.removeEventListener("click", handleClick),
      ];
    });

    const handleMouseLeave = () => moveTo(activeLink);
    const handleFocusOut = (event: FocusEvent) => {
      if (!nav.contains(event.relatedTarget as Node | null)) {
        moveTo(activeLink);
      }
    };
    const handleResize = () => moveTo(activeLink);

    nav.addEventListener("mouseleave", handleMouseLeave);
    nav.addEventListener("focusout", handleFocusOut);
    window.addEventListener("resize", handleResize);

    return () => {
      removeListeners.forEach((remove) => remove());
      nav.removeEventListener("mouseleave", handleMouseLeave);
      nav.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-stone-900"
          >
            MurMurLab
          </Link>
          <p className="text-sm text-stone-500">
            Digitalt galleri for visuelle eksperimenter
          </p>
        </div>

        <nav
          ref={navRef}
          className="js-portfolio-nav relative inline-flex items-center gap-1 overflow-hidden rounded-full border border-stone-200 bg-white/80 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md"
          aria-label="Hovednavigasjon"
        >
          <span
            className="js-portfolio-nav-slider pointer-events-none absolute left-1 top-1 rounded-full bg-stone-900/[0.07] shadow-sm"
            aria-hidden="true"
          ></span>

          <a
            href="#demo"
            className="js-portfolio-nav-link relative z-10 rounded-full px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors duration-200"
            data-active="true"
          >
            Galleri
          </a>
          <a
            href="#modules"
            className="js-portfolio-nav-link relative z-10 rounded-full px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors duration-200"
          >
            Last opp
          </a>
          <a
            href="#pricing"
            className="js-portfolio-nav-link relative z-10 rounded-full px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors duration-200"
          >
            Min profil
          </a>
        </nav>
      </div>
    </header>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
      <span className="inline-block h-2 w-2 rounded-full bg-[#E6C15A]" />
      {text}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-white/55">
        {label}
      </div>
      <div className="text-sm font-semibold text-white/85">{value}</div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/70">{desc}</div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold tracking-[0.2em] text-[#E6C15A]/90">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-pretty text-white/75">{subtitle}</p>
    </div>
  );
}

/* ------------------------------ Demo / Trust ------------------------------ */

function DemoPanel() {
  const mockSteps = [
    {
      k: "Plan",
      v: "Velg Growth Constellation → mål: øk CTR på 14 dager",
    },
    {
      k: "Handling",
      v: "Genererte 3 hooks og 2 varianter per hook, foreslo publisering",
    },
    {
      k: "Resultat",
      v: "Variant B ga +22% CTR på 1 100 visninger (mock data)",
    },
    {
      k: "Læring",
      v: "Oppdaterte hook-pattern: «konkret payoff tidlig» → prioritet ↑",
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/90">
            Agent Replay
          </div>
          <div className="mt-1 text-xs text-white/60">
            (Mock) Klikkbar forklaring for hvert steg.
          </div>
        </div>
        <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75">
          RUN #042 • OK
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {mockSteps.map((s) => (
          <div
            key={s.k}
            className="rounded-2xl border border-white/10 bg-[#0B0616]/40 p-4"
          >
            <div className="text-xs font-semibold tracking-wide text-[#E6C15A]/90">
              {s.k.toUpperCase()}
            </div>
            <div className="mt-1 text-sm text-white/80">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="rounded-xl bg-[#E6C15A] px-4 py-2 text-sm font-semibold text-[#0B0616] hover:brightness-110"
          onClick={() => {
            // mock interaction
            alert("Mock: Her ville vi kalle /api/run med et goal-payload.");
          }}
        >
          Kjør ny demo-run
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
          onClick={() => {
            alert("Mock: Her ville vi hente /api/replay?runId=042 og vise full logg.");
          }}
        >
          Hvorfor gjorde agenten dette?
        </button>
      </div>

      <div className="mt-4 text-xs text-white/55">
        Neste steg: bytt alert() til fetch() mot ekte API.
      </div>
    </div>
  );
}

function TrustPanel() {
  const bullets = [
    {
      title: "Observability",
      desc: "Hver handling logges med input, verktøy, output og resultat.",
    },
    {
      title: "Kontroll",
      desc: "Terskler for godkjenning + kill-switch når signalet er dårlig.",
    },
    {
      title: "Sikkerhet",
      desc: "Minste nødvendige tilgang, tydelige scopes, audit-spor.",
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="text-sm font-semibold text-white/90">
        Trust & Control
      </div>
      <div className="mt-1 text-xs text-white/60">
        Bygget for production-følelse fra dag 1.
      </div>

      <div className="mt-5 space-y-3">
        {bullets.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-white/10 bg-[#0B0616]/40 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{b.title}</div>
              <span className="text-[#E6C15A]">✦</span>
            </div>
            <div className="mt-1 text-sm text-white/70">{b.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#0B0616]/40 p-4">
        <div className="text-xs font-semibold tracking-wide text-white/70">
          “SANNTIDS-LÆRING” I PRAKSIS
        </div>
        <div className="mt-2 text-sm text-white/75">
          Måling → eksperiment → evaluering → policy-oppdatering (prompts, regler
          og verktøyvalg). Ikke ukontrollert “random learning”.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Modules / Pricing ------------------------------ */

function ModuleCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="text-base font-semibold">{title}</div>
      <ul className="mt-4 space-y-2 text-sm text-white/75">
        {bullets.map((x) => (
          <li key={x} className="flex gap-2">
            <span className="mt-0.5 text-[#E6C15A]">✦</span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
        >
          Velg denne
          <span>→</span>
        </a>
      </div>
    </div>
  );
}

function PriceCard({
  tier,
  price,
  tag,
  features,
  cta,
  highlight,
}: {
  tier: string;
  price: string;
  tag: string;
  features: string[];
  cta: string;
  highlight: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border bg-white/5 p-6 backdrop-blur",
        highlight
          ? "border-[#E6C15A]/40 shadow-[0_0_0_1px_rgba(230,193,90,0.15),0_40px_120px_rgba(230,193,90,0.12)]"
          : "border-white/10",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{tier}</div>
          <div className="mt-1 text-xs text-white/60">{tag}</div>
        </div>
        {highlight && (
          <div className="rounded-full bg-[#E6C15A] px-3 py-1 text-xs font-semibold text-[#0B0616]">
            Mest valgt
          </div>
        )}
      </div>

      <div className="mt-5 text-3xl font-semibold tracking-tight">
        {price}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-white/75">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="mt-0.5 text-[#E6C15A]">✦</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <a
          href="mailto:MurMurAi@proton.me"
          className={[
            "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition",
            highlight
              ? "bg-[#E6C15A] text-[#0B0616] hover:brightness-110"
              : "border border-white/15 bg-white/5 text-white/90 hover:bg-white/10",
          ].join(" ")}
        >
          {cta}
        </a>
        <div className="mt-2 text-center text-xs text-white/55">
          Mail: MurMurAi@proton.me
        </div>
      </div>
    </div>
  );
}
