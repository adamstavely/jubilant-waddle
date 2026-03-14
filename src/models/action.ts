/**
 * Action model for AI Assist Panel Actions tab
 */

export type ActionScope = 'document' | 'batch';

export interface ActionConfig {
  id: string;
  label: string;
  description: string;
  scope: ActionScope;
  icon?: string;
}

export interface ActionEvent {
  actionId: string;
  scope: ActionScope;
  documentId?: string;
  batchId?: string;
}

export interface ActionResultEvent {
  actionId: string;
  title: string;
  content: string;
  status: 'success' | 'error';
}

export const SINGLE_DOC_ACTIONS: ActionConfig[] = [
  { id: 'redact-pii', label: 'REDACT PII', description: 'Identify and redact personally identifiable information', scope: 'document' },
  { id: 'privilege-log', label: 'PRIVILEGE LOG', description: 'Generate privilege log entries', scope: 'document' },
  { id: 'build-timeline', label: 'BUILD TIMELINE', description: 'Extract and order events chronologically', scope: 'document' },
  { id: 'depo-prep', label: 'DEPOSITION PREP', description: 'Prepare deposition outline and key topics', scope: 'document' },
  { id: 'issue-spotting', label: 'ISSUE SPOTTING', description: 'Identify legal issues and risks', scope: 'document' },
  { id: 'compare-docs', label: 'COMPARE DOCUMENTS', description: 'Compare with another document (delegates to host)', scope: 'document' },
];

export const BATCH_ACTIONS: ActionConfig[] = [
  { id: 'batch-summary', label: 'BATCH SUMMARY', description: 'Generate summary report for the batch', scope: 'batch' },
  { id: 'entity-network', label: 'ENTITY RELATIONSHIP MAP', description: 'Map relationships between entities', scope: 'batch' },
  { id: 'hot-doc-detection', label: 'HOT DOCUMENT DETECTION', description: 'Identify highly relevant documents', scope: 'batch' },
  { id: 'auto-code-batch', label: 'AUTO-CODE BATCH', description: 'Apply coding suggestions across batch', scope: 'batch' },
];
