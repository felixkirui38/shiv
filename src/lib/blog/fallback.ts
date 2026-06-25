import {
  defaultBlogPosts,
  getDefaultBlogPost,
  type DefaultBlogPost,
} from "@/config/blog.defaults";

const STUB_DATE = "2026-01-01T00:00:00.000Z";

function toIsoDate(date: string) {
  return new Date(`${date}T09:00:00.000Z`).toISOString();
}

function serializeFallbackList(post: DefaultBlogPost) {
  return {
    id: `fallback-blog-${post.slug}`,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    tags: post.tags,
    status: "PUBLISHED" as const,
    isPublished: true,
    isFeatured: true,
    publishedAt: toIsoDate(post.date),
    scheduledAt: null,
    viewCount: 0,
    metaTitle: post.metaTitle ?? post.title,
    metaDescription: post.metaDescription ?? post.excerpt,
    createdAt: STUB_DATE,
    updatedAt: STUB_DATE,
    category: {
      id: `fallback-cat-${post.categorySlug}`,
      name: post.category,
      slug: post.categorySlug,
      color: null,
    },
    categoryName: post.category,
    author: {
      id: "fallback-author",
      firstName: "Shiv",
      lastName: "Insurance",
      email: "info@shivinsbro.co.ke",
      avatarUrl: null,
      name: "Shiv Insurance",
    },
    authorName: "Shiv Insurance",
    featuredImage: null,
    featuredImageUrl: null,
    commentCount: 0,
  };
}

export function getFallbackPostBySlug(slug: string) {
  const post = getDefaultBlogPost(slug);
  if (!post) return null;

  return {
    ...serializeFallbackList(post),
    content: post.content.trim(),
    metaKeywords: post.tags.join(", "),
    comments: [] as {
      id: string;
      authorName: string;
      content: string;
      createdAt: string;
    }[],
  };
}

export function listFallbackPublishedPosts(filters?: {
  categorySlug?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  let posts = [...defaultBlogPosts];

  if (filters?.categorySlug) {
    posts = posts.filter((p) => p.categorySlug === filters.categorySlug);
  }
  if (filters?.tag) {
    posts = posts.filter((p) => p.tags.includes(filters.tag!));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
    );
  }

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 12;
  const total = posts.length;
  const start = (page - 1) * limit;
  const slice = posts.slice(start, start + limit);

  return {
    items: slice.map(serializeFallbackList),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function getFallbackFeaturedPosts(limit = 3) {
  return defaultBlogPosts.slice(0, limit).map(serializeFallbackList);
}
