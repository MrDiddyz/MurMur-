export type AgentName = "Trend"|"Market"|"Tech"|"Revenue"|"Execution";
export type ReportType = "decode"|"audit"|"council";
export interface SignalRun {id:string; type:ReportType; input:string; signalScore:number; createdAt:string;}
export interface NarrativeDecodeResult {summary:string; hiddenPatterns:string[]; strongPhrases:string[]; narrativeAngles:string[]; projectOpportunities:string[]; next7Days:string[]; signalScore:number;}
export interface SignalAuditResult {moneyLeaks:string[]; trustLeaks:string[]; attentionLeaks:string[]; missingAutomation:string[]; brandingIssues:string[]; quickWins:string[]; paidOfferAngle:string; signalScore:number;}
export type CouncilScore = Record<AgentName, number>;
export interface CouncilResult {totalScore:number; decision:"ship"|"revise"|"kill"; confidence:number; reasoning:string[]; risks:string[]; nextAction:string; scores:CouncilScore;}