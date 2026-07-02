import { prisma } from "@/lib/prisma";
import {
  buildSubmissionFieldRows,
  previewFromSubmissionData,
  type FormFieldMeta,
} from "@/lib/admin/form-submission-display";

export async function listFormSubmissions(
  formId: string,
  options: { page?: number; limit?: number; search?: string } = {}
) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 25;
  const skip = (page - 1) * limit;

  const items = await prisma.formSubmission.findMany({
    where: { formId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  const search = options.search?.toLowerCase().trim();
  const filtered = search
    ? items.filter((s) => {
        const data = s.data as Record<string, unknown>;
        const blob = JSON.stringify(data).toLowerCase();
        const submitter = s.user?.email?.toLowerCase() ?? "";
        return blob.includes(search) || submitter.includes(search);
      })
    : items;

  const total = filtered.length;
  const pageItems = filtered.slice(skip, skip + limit);

  return {
    items: pageItems.map((s) => {
      const data = (s.data as Record<string, unknown>) ?? {};
      return {
        id: s.id,
        status: s.status,
        submittedBy: s.user
          ? `${s.user.firstName ?? ""} ${s.user.lastName ?? ""}`.trim() || s.user.email
          : "Guest",
        email: s.user?.email ?? (typeof data.email === "string" ? data.email : null),
        preview: previewFromSubmissionData(data),
        createdAt: s.createdAt.toISOString(),
      };
    }),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getFormSubmissionDetail(formId: string, submissionId: string) {
  const submission = await prisma.formSubmission.findFirst({
    where: { id: submissionId, formId },
    include: {
      form: {
        include: {
          fields: { orderBy: { sortOrder: "asc" } },
        },
      },
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      },
    },
  });

  if (!submission) return null;

  const data = (submission.data as Record<string, unknown>) ?? {};
  const fieldMeta: FormFieldMeta[] = submission.form.fields.map((f) => ({
    key: f.key,
    label: f.label,
    type: f.type,
    section: (f.validation as { section?: string } | null)?.section,
  }));

  return {
    id: submission.id,
    status: submission.status,
    ipAddress: submission.ipAddress,
    userAgent: submission.userAgent,
    createdAt: submission.createdAt.toISOString(),
    form: {
      id: submission.form.id,
      name: submission.form.name,
      slug: submission.form.slug,
    },
    submitter: submission.user
      ? {
          id: submission.user.id,
          name:
            `${submission.user.firstName ?? ""} ${submission.user.lastName ?? ""}`.trim() ||
            submission.user.email,
          email: submission.user.email,
          phone: submission.user.phone,
        }
      : {
          id: null,
          name: typeof data.fullName === "string" ? data.fullName : "Guest",
          email: typeof data.email === "string" ? data.email : null,
          phone: typeof data.phone === "string" ? data.phone : null,
        },
    data,
    fields: buildSubmissionFieldRows(data, fieldMeta),
  };
}
