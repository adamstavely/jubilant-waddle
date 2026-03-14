/**
 * Document model for AI Assist Panel
 */

export interface AiDocument {
  id: string;
  name: string;
  mimeType: string;
  pageCount: number;
  custodian: string;
  createdAt: string; // ISO 8601
  batchId: string;
}
