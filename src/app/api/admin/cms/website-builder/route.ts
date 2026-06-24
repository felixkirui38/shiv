import { requireAdmin } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getBuilderState,
  listWebsiteVersions,
  publishBuilder,
  publishVersionDirectly,
  rollbackToVersion,
  saveBuilderDraft,
} from "@/lib/cms/website-builder";
import type { WebsiteBuilderPayload } from "@/types/website-builder";

export async function GET(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const url = new URL(req.url);
  if (url.searchParams.get("versions") === "1") {
    const versions = await listWebsiteVersions();
    return apiSuccess(versions);
  }

  const state = await getBuilderState();
  return apiSuccess(state);
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = (await req.json()) as WebsiteBuilderPayload;
  const state = await saveBuilderDraft(body, auth.session!.user!.id);

  await logAudit({
    userId: auth.session!.user!.id,
    action: "update",
    entity: "websiteBuilder",
    newData: { draft: true },
  });

  return apiSuccess(state);
}

export async function POST(req: Request) {
  const auth = await requireAdmin(PERMISSIONS.CMS_MANAGE);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await req.json();
  const action = body.action as string;

  try {
    if (action === "publish") {
      const published = await publishBuilder(auth.session!.user!.id);
      await logAudit({
        userId: auth.session!.user!.id,
        action: "publish",
        entity: "websiteBuilder",
        entityId: published.id,
      });
      return apiSuccess({ published: true, versionId: published.id });
    }

    if (action === "rollback") {
      const { versionId, publish } = body as { versionId: string; publish?: boolean };
      if (!versionId) return apiError("versionId required", 400);

      if (publish) {
        const published = await publishVersionDirectly(versionId, auth.session!.user!.id);
        await logAudit({
          userId: auth.session!.user!.id,
          action: "rollback_publish",
          entity: "websiteBuilder",
          entityId: published.id,
        });
        return apiSuccess({ published: true, versionId: published.id });
      }

      const draft = await rollbackToVersion(versionId, auth.session!.user!.id);
      await logAudit({
        userId: auth.session!.user!.id,
        action: "rollback_draft",
        entity: "websiteBuilder",
        entityId: draft.id,
      });
      const state = await getBuilderState();
      return apiSuccess(state);
    }

    return apiError("Unknown action", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return apiError(message, 400);
  }
}
