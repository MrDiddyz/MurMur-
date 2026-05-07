import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auditInputSchema, auditReportSchema } from '@/lib/audit-schema';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const input = auditInputSchema.safeParse(await request.json());
  if (!input.success) {
    return NextResponse.json({ error: input.error.issues[0]?.message ?? 'Invalid audit input.' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `Create a premium MurMur Signal Audit for a local business. Be specific, strategic, direct, and useful. Avoid generic filler. Return only JSON matching this shape: {
  "executiveSummary": string,
  "observations": string[],
  "narrative": string,
  "signalLeaks": [{"title": string, "severity": "low"|"medium"|"high", "impact": string}],
  "recommendations": [{"title": string, "detail": string, "priority": "low"|"medium"|"high"}],
  "score": {"overall": number, "visibility": number, "trust": number, "conversion": number, "consistency": number},
  "sevenDayActionPlan": [{"day": number, "action": string, "outcome": string}]
}
Business: ${input.data.businessName}
Website: ${input.data.website}
Industry: ${input.data.industry}
Notes: ${input.data.notes || 'No notes provided.'}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.55,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are MurMur, an elite local business signal strategist. You diagnose visibility, trust, conversion, and consistency leaks.' },
        { role: 'user', content: prompt }
      ]
    });

    const raw = completion.choices[0]?.message.content;
    if (!raw) {
      return NextResponse.json({ error: 'The AI returned an empty audit.' }, { status: 502 });
    }

    const report = auditReportSchema.parse(JSON.parse(raw));
    const { data, error } = await supabase
      .from('signal_audits')
      .insert({
        user_id: user.id,
        business_name: input.data.businessName,
        website: input.data.website,
        industry: input.data.industry,
        notes: input.data.notes,
        report,
        score: report.score.overall
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate audit.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
