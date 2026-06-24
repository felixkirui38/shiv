import { BlogPostForm } from "@/components/admin/blog-post-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata = { title: "New Blog Post | Admin" };

export default function NewBlogPostPage() {
  return (
    <div>
      <AdminPageHeader title="New blog post" description="Create a new article for the insurance blog." />
      <BlogPostForm mode="create" />
    </div>
  );
}
