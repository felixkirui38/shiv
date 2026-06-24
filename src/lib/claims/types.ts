import type { ClaimDocumentCategory, ClaimStatus } from "@/generated/prisma/client";

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Review",
  INVESTIGATION: "Investigation",
  DOCUMENTS_REQUESTED: "Documents Requested",
  APPROVED: "Approved",
  PARTIALLY_APPROVED: "Partially Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
  CLOSED: "Closed",
};

export const CLAIM_STATUS_STYLES: Record<ClaimStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  INVESTIGATION: "bg-purple-100 text-purple-800",
  DOCUMENTS_REQUESTED: "bg-orange-100 text-orange-800",
  APPROVED: "bg-green-100 text-green-800",
  PARTIALLY_APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-800",
  PAID: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-slate-100 text-slate-500",
};

export const DOCUMENT_CATEGORY_LABELS: Record<ClaimDocumentCategory, string> = {
  POLICE_ABSTRACT: "Police Abstract",
  PHOTO: "Photos",
  VIDEO: "Videos",
  MEDICAL_REPORT: "Medical Reports",
  OTHER: "Other",
};

export const ALLOWED_CLAIM_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export const MAX_CLAIM_FILE_MB = 25;

export interface ClaimTimelineEvent {
  id: string;
  type: "status" | "note" | "communication";
  title: string;
  description?: string;
  createdAt: string;
  actor?: string;
  isInternal?: boolean;
}
