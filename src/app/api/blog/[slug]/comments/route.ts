import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getPostBySlug } from "@/lib/blog/queries";
import { blogCommentSchema } from "@/validations/blog";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const post = await getPostBySlug(slug);
  if (!post) return apiError("Post not found", 404);

  const body = await req.json();
  const parsed = blogCommentSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid comment", 400);

  const comment = await prisma.blogComment.create({
    data: {
      postId: post.id,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail,
      content: parsed.data.content,
      status: "PENDING",
    },
  });

  return apiSuccess(
    {
      id: comment.id,
      message: "Comment submitted for moderation.",
    },
    201
  );
}
