export interface StepResource {
  id: string;
  documentId: string;
  stepId: string;
  url: string;
  /** Page title (or other display name) for the URL, when known. */
  label?: string;
  sortOrder: number;
  createdAt: number;
}

export interface StepResourceInput {
  id?: string;
  documentId: string;
  stepId: string;
  url: string;
  label?: string;
  sortOrder?: number;
  createdAt?: number;
}
