import {
  getApplicationById,
  updateApplicationDraft,
} from "@/lib/purchase/service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) return apiError("Application not found", 404);
  return apiSuccess(application);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      currentStep?: number;
      formData?: Record<string, unknown>;
      status?: "DRAFT" | "SUBMITTED";
    };

    const application = await updateApplicationDraft(id, {
      currentStep: body.currentStep,
      formData: body.formData,
      status: body.status,
    });

    return apiSuccess(application);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return apiError(message, 400);
  }
}
