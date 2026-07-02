import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EDITABLE_STATUSES = ["DRAFT", "SUBMITTED", "PENDING_PAYMENT"];

export async function getApplicationForAccess(applicationId: string, req: Request) {
  const session = await auth();
  const resumeToken = req.headers.get("x-resume-token");
  const sessionId = req.headers.get("x-session-id");

  const app = await prisma.insuranceApplication.findUnique({
    where: { id: applicationId },
  });
  if (!app) return null;
  if (!EDITABLE_STATUSES.includes(app.status)) return null;

  if (session?.user?.id && app.userId === session.user.id) return app;
  if (resumeToken && app.resumeToken === resumeToken) return app;
  if (sessionId && app.sessionId === sessionId) return app;

  return null;
}
