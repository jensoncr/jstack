// The data model and interfaces for RFQ intake.
// This file is the only place fields and call signatures live.

export type RequestStatus = "draft" | "needs_review" | "ready" | "exported";

export type AttachmentKind = "drawing" | "model" | "spec" | "other";

export type FlagCode =
  | "QUANTITY_MISSING"
  | "DUE_DATE_MISSING"
  | "DRAWING_MISSING"
  | "REVISION_CONFLICT";

export interface Customer {
  id: string;
  name: string;
  exportControlled: boolean;
}

export interface QuoteRequest {
  id: string;
  customerId: string;
  receivedAt: string;
  sourceEmailId: string;
  status: RequestStatus;
  dueDate: string | null;
  lineItems: LineItem[];
  attachments: Attachment[];
  flags: Flag[];
}

export interface LineItem {
  id: string;
  partNumber: string;
  revision: string | null;
  quantity: number | null;
  drawingId: string | null;
}

export interface Attachment {
  id: string;
  filename: string;
  kind: AttachmentKind;
  sha256: string;
}

export interface Flag {
  id: string;
  code: FlagCode;
  lineItemId: string | null;
  message: string;
  resolvedBy: string | null;
}

export interface RawEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  attachments: { filename: string; bytes: Uint8Array }[];
}

export interface Resolution {
  flagId: string;
  value: string | number | null;
  resolvedBy: string;
}

export interface Intake {
  ingest(email: RawEmail): Promise<QuoteRequest>;
  review(requestId: string, resolutions: Resolution[]): Promise<QuoteRequest>;
  export(requestId: string): Promise<{ path: string }>;
}
