import { notFound } from "next/navigation";
import { getAdminPost } from "@/lib/blog/queries";
import { BlogPostForm, type BlogPostFormData } from "@/components/admin/blog-post-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata = { title: "Edit Blog Post | Admin" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPost(id);
  if (!post) notFound();

  const initial: BlogPostFormData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    categoryId: post.categoryId ?? null,
    authorId: post.authorId ?? null,
    featuredImageId: post.featuredImageId ?? null,
    featuredImageUrl: post.featuredImageUrl ?? null,
    tags: post.tags,
    status: post.status,
    scheduledAt: post.scheduledAt
      ? new Date(post.scheduledAt).toISOString().slice(0, 16)
      : "",
    isFeatured: post.isFeatured,
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    metaKeywords: post.metaKeywords ?? "",
  };

  return (
    <div>
      <AdminPageHeader
        title={`Edit: ${post.title}`}
        description="Update content, SEO, scheduling, and featured image."
      />
      <BlogPostForm mode="edit" initial={initial} />
    </div>
  );
}
