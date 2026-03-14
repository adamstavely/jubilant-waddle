/**
 * Analysis result model for AI Assist Panel
 */

export type RiskSeverity = 'HIGH' | 'MED' | 'LOW';

export interface RiskFlag {
  id: string;
  severity: RiskSeverity;
  title: string;
  description: string;
  pageRefs: number[];
}

export interface CodingSuggestion {
  field: string;
  label: string;
  value: string;
  confidence: number; // 0.0 – 1.0
  accepted: boolean;
}

export interface PrivilegeAssessment {
  attorneyClient: 'Yes' | 'No' | 'Likely' | 'Unknown';
  workProduct: 'Yes' | 'No' | 'Likely' | 'Unknown';
  commonInterest: 'Yes' | 'No' | 'Likely' | 'Unknown';
  confidential: 'Yes' | 'No' | 'Likely' | 'Unknown';
  rationale: string;
}

export interface DocumentSummary {
  text: string;
}

export interface RelatedDocument {
  documentId: string;
  name: string;
  relevance: string;
}

export interface AiAnalysisResult {
  documentId: string;
  generatedAt: string;
  tokenCount: number;
  summary: DocumentSummary;
  riskFlags: RiskFlag[];
  privilege: PrivilegeAssessment;
  codingSuggestions: CodingSuggestion[];
  relatedDocs: RelatedDocument[];
}
