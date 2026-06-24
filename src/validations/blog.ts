import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  categoryId: z.string().nullable().optional(),
  authorId: z.string().nullable().optional(),
  featuredImageId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  scheduledAt: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

export const blogCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const blogCommentSchema = z.object({
  authorName: z.string().min(1),
  authorEmail: z.string().email(),
  content: z.string().min(3).max(2000),
});

export const commentModerationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SPAM"]),
});
