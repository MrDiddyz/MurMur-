export type AuditInput = {
  businessName: string;
  website: string;
  industry: string;
  notes?: string;
};

export type AuditReport = {
  executiveSummary: string;
  observations: string[];
  narrative: string;
  signalLeaks: Array<{ title: string; severity: 'low' | 'medium' | 'high'; impact: string }>;
  recommendations: Array<{ title: string; detail: string; priority: 'low' | 'medium' | 'high' }>;
  score: { overall: number; visibility: number; trust: number; conversion: number; consistency: number };
  sevenDayActionPlan: Array<{ day: number; action: string; outcome: string }>;
};

export type AuditRow = {
  id: string;
  user_id: string;
  business_name: string;
  website: string;
  industry: string;
  notes: string | null;
  report: AuditReport;
  score: number;
  created_at: string;
};
