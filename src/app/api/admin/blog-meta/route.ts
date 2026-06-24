import { requireAdmin } from "@/lib/admin/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import { listAllTags, listAuthors } from "@/lib/blog/queries";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.BLOG_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const type = new URL(req.url).searchParams.get("type");

  if (type === "authors") {
    const authors = await listAuthors();
    return apiSuccess(
      authors.map((a) => ({
        id: a.id,
        name: `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || a.email,
        email: a.email,
        avatarUrl: a.avatarUrl,
      }))
    );
  }

  const tags = await listAllTags();
  return apiSuccess(tags);
}
