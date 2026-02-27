export default function Constellation() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute inset-0 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(230,193,90,0.16),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(176,120,255,0.16),transparent_55%)]" />
      </div>

      <div className="absolute inset-10 rounded-full border border-white/10 opacity-70" />
      <div className="absolute inset-20 rounded-full border border-white/10 opacity-50" />
      <div className="absolute inset-28 rounded-full border border-white/10 opacity-35" />

      <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden="true">
        <path
          d="M22 30 L50 18 L76 32 L70 62 L36 72 L22 30"
          fill="none"
          stroke="rgba(230,193,90,0.25)"
          strokeWidth="0.6"
        />
        <path
          d="M50 18 L52 50 L70 62"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.6"
        />
        <path
          d="M36 72 L52 50 L22 30"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.6"
        />
      </svg>

      <Node label="Teacher" sub="Rubric" className="left-[14%] top-[26%]" pulseDelay="0s" />
      <Node
        label="Experimental"
        sub="Try"
        className="left-[45%] top-[12%]"
        pulseDelay="0.6s"
      />
      <Node
        label="Think-Tank"
        sub="Sim"
        className="left-[72%] top-[30%]"
        pulseDelay="1.2s"
      />
      <Node
        label="Reflective"
        sub="Learn"
        className="left-[64%] top-[62%]"
        pulseDelay="1.8s"
      />
      <Node
        label="Outcome"
        sub="Ship"
        className="left-[30%] top-[72%]"
        pulseDelay="2.4s"
      />

      <Particle className="left-[18%] top-[18%]" delay="0s" />
      <Particle className="left-[78%] top-[18%]" delay="1s" />
      <Particle className="left-[18%] top-[78%]" delay="2s" />
      <Particle className="left-[78%] top-[78%]" delay="3s" />

      <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-[#0B0616]/40 p-4 backdrop-blur">
        <div className="text-sm font-semibold text-white/90">
          “Speiling” = kvalitet uten støy
        </div>
        <div className="mt-1 text-xs text-white/70">
          Forslag → kritikk → verifisering → læring → bedre neste run.
        </div>
      </div>

      <style>{`
        @keyframes murmurPulse {
          0% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.18); opacity: 0.18; }
          100% { transform: scale(1); opacity: 0.55; }
        }
        @keyframes murmurFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes murmurParticle {
          0% { transform: translate(0,0); opacity: 0.1; }
          30% { opacity: 0.55; }
          70% { opacity: 0.25; }
          100% { transform: translate(18px,-14px); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

function Node({
  label,
  sub,
  className,
  pulseDelay,
}: {
  label: string;
  sub: string;
  className: string;
  pulseDelay: string;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ animation: 'murmurFloat 6s ease-in-out infinite' }}
    >
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 0 1px rgba(230,193,90,0.25)' }}
        />
        <div
          className="absolute -inset-3 rounded-full"
          style={{
            background:
              'radial-gradient(circle at center, rgba(230,193,90,0.22), transparent 55%)',
            animation: 'murmurPulse 2.8s ease-in-out infinite',
            animationDelay: pulseDelay,
          }}
        />
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-[#0B0616]/40 backdrop-blur">
          <div className="text-[10px] font-semibold text-white/80">{label}</div>
          <div className="text-[10px] text-[#E6C15A]/90">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function Particle({ className, delay }: { className: string; delay: string }) {
  return (
    <div
      className={`absolute ${className} h-1.5 w-1.5 rounded-full bg-white/60`}
      style={{ animation: 'murmurParticle 6.5s ease-in-out infinite', animationDelay: delay }}
      aria-hidden="true"
    />
  );
}
