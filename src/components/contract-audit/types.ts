export type RiskLevel = "high" | "medium" | "info";

export interface RiskItem {
  id: string;
  level: RiskLevel;
  title: string;
  excerpt: string;
  suggestion: string;
  /** start index in the original text for highlight matching */
  excerptStart: number;
  excerptEnd: number;
}

export interface AuditResult {
  risks: RiskItem[];
  summary: string;
}

export interface ContractSettings {
  apiUrl: string;
  apiKey: string;
  model: string;
  promptTemplate: string;
}
