import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";
import {
  getFallbackFeaturedPosts,
  getFallbackPostBySlug,
  listFallbackPublishedPosts,
} from "@/lib/blog/fallback";
import type { BlogPostStatus } from "@/generated/prisma/client";

const postInclude = {
  category: { select: { id: true, name: true, slug: true, color: true } },
  author: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
  featuredImage: { select: { id: true, url: true, alt: true } },
  _count: { select: { comments: true } },
};

export async function publishDueScheduledPosts() {
  try {
    const now = new Date();
    await prisma.blogPost.updateMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      data: {
        status: "PUBLISHED",
        isPublished: true,
        publishedAt: now,
      },
    });
  } catch {
    // database unavailable — skip scheduled publish sweep
  }
}

function isPubliclyVisible(status: BlogPostStatus, scheduledAt: Date | null) {
  if (status === "PUBLISHED") return true;
  if (status === "SCHEDULED" && scheduledAt && scheduledAt <= new Date()) return true;
  return false;
}

export function serializePostList(post: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  tags: string[];
  status: BlogPostStatus;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string; color: string | null } | null;
  author: { id: string; firstName: string | null; lastName: string | null; email: string; avatarUrl: string | null } | null;
  featuredImage: { id: string; url: string; alt: string | null } | null;
  _count?: { comments: number };
}) {
  const authorName = post.author
    ? `${post.author.firstName ?? ""} ${post.author.lastName ?? ""}`.trim() || post.author.email
    : null;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags,
    status: post.status,
    isPublished: post.isPublished,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    viewCount: post.viewCount,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    category: post.category,
    categoryName: post.category?.name,
    author: post.author ? { ...post.author, name: authorName } : null,
    authorName,
    featuredImage: post.featuredImage,
    featuredImageUrl: post.featuredImage?.url,
    commentCount: post._count?.comments ?? 0,
  };
}

export async function listPublishedPosts(filters?: {
  categorySlug?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await publishDueScheduledPosts();

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 12;
  const skip = (page - 1) * limit;

  const publishedFilter = {
    OR: [
      { status: "PUBLISHED" as const },
      { status: "SCHEDULED" as const, scheduledAt: { lte: new Date() } },
    ],
  };

  const where = {
    AND: [
      publishedFilter,
      ...(filters?.categorySlug ? [{ category: { slug: filters.categorySlug } }] : []),
      ...(filters?.tag ? [{ tags: { has: filters.tag } }] : []),
      ...(filters?.search
        ? [{
            OR: [
              { title: { contains: filters.search, mode: "insensitive" as const } },
              { excerpt: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }]
        : []),
    ],
  };

  try {
    const [items, total] = await withDbRetry(() =>
      Promise.all([
        prisma.blogPost.findMany({
          where,
          orderBy: { publishedAt: "desc" },
          skip,
          take: limit,
          include: postInclude,
        }),
        prisma.blogPost.count({ where }),
      ])
    );

    if (items.length > 0) {
      return {
        items: items.map(serializePostList),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }
  } catch {
    // fall through to static posts
  }

  return listFallbackPublishedPosts(filters);
}

export async function getFeaturedPosts(limit = 3) {
  await publishDueScheduledPosts();

  try {
    const featured = await withDbRetry(() =>
      prisma.blogPost.findMany({
        where: {
          isFeatured: true,
          OR: [
            { status: "PUBLISHED" },
            { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: limit,
        include: postInclude,
      })
    );

    if (featured.length >= limit) return featured.map(serializePostList);

    const rest = await prisma.blogPost.findMany({
      where: {
        isFeatured: false,
        OR: [
          { status: "PUBLISHED" },
          { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: limit - featured.length,
      include: postInclude,
    });

    const combined = [...featured, ...rest];
    if (combined.length > 0) return combined.map(serializePostList);
  } catch {
    // fall through
  }

  return getFallbackFeaturedPosts(limit);
}

export async function getPostBySlug(slug: string, incrementViews = false) {
  await publishDueScheduledPosts();

  try {
    const post = await withDbRetry(() =>
      prisma.blogPost.findUnique({
        where: { slug },
        include: {
          ...postInclude,
          comments: {
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
          },
        },
      })
    );

    if (post && isPubliclyVisible(post.status, post.scheduledAt)) {
      if (incrementViews) {
        await prisma.blogPost
          .update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } },
          })
          .catch(() => undefined);
      }

      return {
        ...serializePostList(post),
        content: post.content,
        metaKeywords: post.metaKeywords,
        comments: post.comments.map((c) => ({
          id: c.id,
          authorName: c.authorName,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
        })),
      };
    }
  } catch {
    // fall through to static post
  }

  return getFallbackPostBySlug(slug);
}

export async function listAdminPosts(filters?: {
  search?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 25;
  const skip = (page - 1) * limit;

  const where = {
    ...(filters?.status ? { status: filters.status as BlogPostStatus } : {}),
    ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters?.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            { slug: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: postInclude,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    items: items.map(serializePostList),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAdminPost(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      ...postInclude,
      comments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!post) return null;
  return {
    ...serializePostList(post),
    content: post.content,
    metaKeywords: post.metaKeywords,
    categoryId: post.categoryId,
    authorId: post.authorId,
    featuredImageId: post.featuredImageId,
    comments: post.comments,
  };
}

export async function listCategories() {
  return prisma.blogCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });
}

export async function listAllTags() {
  const posts = await prisma.blogPost.findMany({ select: { tags: true } });
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return [...tagSet].sort();
}

export async function listAuthors() {
  return prisma.user.findMany({
    where: { role: { not: "CUSTOMER" }, status: "ACTIVE" },
    select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
    orderBy: { firstName: "asc" },
  });
}

export function toHomepageBlogPost(post: ReturnType<typeof serializePostList> extends infer T ? T : never) {
  const p = post as {
    slug: string;
    title: string;
    excerpt: string | null;
    categoryName?: string;
    publishedAt: string | null;
    featuredImageUrl?: string | null;
  };
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    category: p.categoryName ?? "General",
    date: p.publishedAt
      ? new Date(p.publishedAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })
      : "",
    imageUrl: p.featuredImageUrl ?? undefined,
  };
}
