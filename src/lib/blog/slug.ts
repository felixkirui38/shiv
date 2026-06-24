export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uniquePostSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const { prisma } = await import("@/lib/prisma");
  let base = slugify(title) || "post";
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.blogPost.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function uniqueCategorySlug(name: string, excludeId?: string): Promise<string> {
  const { prisma } = await import("@/lib/prisma");
  let base = slugify(name) || "category";
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.blogCategory.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
}
