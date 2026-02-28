export interface Job {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export type CandidateStatus =
  | "uploading"
  | "extracting"
  | "evaluating"
  | "done"
  | "error";

export type CandidateDecision = "pending" | "rejected" | "pool" | "interview";

export interface Candidate {
  id: string;
  jobId: string;
  fileName: string;
  name: string;
  status: CandidateStatus;
  score: number;
  tags: string[];
  strengths: string[];
  risks: string[];
  resumeText: string;
  aiSummary: string;
  decision: CandidateDecision;
  error?: string;
}

export interface LLMSettings {
  apiUrl: string;
  apiKey: string;
  promptTemplate: string;
}
