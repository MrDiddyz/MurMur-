import type { AuditReport as AuditReportType } from '@/lib/types';
import { Card } from '@/components/ui/card';

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.2em] text-smoke"><span>{label}</span><span>{value}</span></div>
      <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-champagne" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function AuditReport({ report }: { report: AuditReportType }) {
  return (
    <div id="audit-report" className="space-y-6">
      <Card className="print-card bg-gold-radial">
        <p className="text-xs uppercase tracking-[0.3em] text-champagne">Executive signal</p>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{report.executiveSummary}</h2>
        <p className="mt-5 text-sm leading-7 text-smoke">{report.narrative}</p>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="print-card">
          <div className="grid size-32 place-items-center rounded-full border border-champagne/30 bg-champagne/10 text-5xl font-semibold text-champagne">{report.score.overall}</div>
          <div className="mt-8 space-y-5">
            <Meter label="Visibility" value={report.score.visibility} />
            <Meter label="Trust" value={report.score.trust} />
            <Meter label="Conversion" value={report.score.conversion} />
            <Meter label="Consistency" value={report.score.consistency} />
          </div>
        </Card>
        <Card className="print-card">
          <h3 className="text-xl font-semibold">Observations</h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-smoke">
            {report.observations.map((observation) => <li key={observation} className="rounded-2xl border border-white/10 bg-black/20 p-4">{observation}</li>)}
          </ul>
        </Card>
      </div>
      <Card className="print-card">
        <h3 className="text-xl font-semibold">Signal leaks</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {report.signalLeaks.map((leak) => (
            <div key={leak.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-champagne">{leak.severity}</span>
              <h4 className="mt-3 font-semibold">{leak.title}</h4>
              <p className="mt-2 text-sm leading-6 text-smoke">{leak.impact}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="print-card">
        <h3 className="text-xl font-semibold">Recommendations</h3>
        <div className="mt-5 space-y-4">
          {report.recommendations.map((recommendation) => (
            <div key={recommendation.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-4"><h4 className="font-semibold">{recommendation.title}</h4><span className="text-xs uppercase tracking-[0.2em] text-champagne">{recommendation.priority}</span></div>
              <p className="mt-2 text-sm leading-6 text-smoke">{recommendation.detail}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="print-card">
        <h3 className="text-xl font-semibold">7-day action plan</h3>
        <div className="mt-5 grid gap-3">
          {report.sevenDayActionPlan.map((item) => (
            <div key={item.day} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[5rem_1fr_1fr]">
              <span className="text-sm font-semibold text-champagne">Day {item.day}</span>
              <span className="text-sm text-mercury">{item.action}</span>
              <span className="text-sm text-smoke">{item.outcome}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
