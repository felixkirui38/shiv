import { z } from "zod";

export const createClaimSchema = z.object({
  policyId: z.string().min(1),
  incidentDate: z.string().min(1),
  description: z.string().min(20, "Please provide a detailed description"),
  claimAmount: z.number().positive(),
});

export const submitClaimSchema = z.object({
  notes: z.string().optional(),
});

export const claimDocumentSchema = z.object({
  category: z.enum([
    "POLICE_ABSTRACT",
    "PHOTO",
    "VIDEO",
    "MEDICAL_REPORT",
    "OTHER",
  ]),
});

export const claimNoteSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().default(false),
});

export const assignOfficerSchema = z.object({
  assignedToId: z.string().nullable(),
});

export const updateClaimStatusSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "INVESTIGATION",
    "DOCUMENTS_REQUESTED",
    "APPROVED",
    "PARTIALLY_APPROVED",
    "REJECTED",
    "PAID",
    "CLOSED",
  ]),
  notes: z.string().optional(),
  approvedAmount: z.number().positive().optional(),
  resolutionNotes: z.string().optional(),
});

export const claimCommunicationSchema = z.object({
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "IN_APP"]),
  subject: z.string().optional(),
  message: z.string().min(1),
});
