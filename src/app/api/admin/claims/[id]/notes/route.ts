import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { claimNoteSchema } from "@/validations/claim";
import type { UserRole } from "@/generated/prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const role = session.user.role as UserRole;
  if (!hasPermission(role, "claims:review")) {
    return apiError("Forbidden", 403);
  }

  try {
    const { id } = await params;
    const body = claimNoteSchema.parse(await req.json());

    const claim = await prisma.claim.findUnique({ where: { id } });
    if (!claim) return apiError("Claim not found", 404);

    const note = await prisma.claimNote.create({
      data: {
        claimId: id,
        authorId: session.user.id,
        content: body.content,
        isInternal: body.isInternal,
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      id: note.id,
      content: note.content,
      isInternal: note.isInternal,
      author: `${note.author.firstName ?? ""} ${note.author.lastName ?? ""}`.trim(),
      createdAt: note.createdAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add note";
    return apiError(message, 400);
  }
}
