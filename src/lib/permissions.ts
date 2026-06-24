import type { UserRole } from "@/generated/prisma/client";

export const PERMISSIONS = {
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",

  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_MANAGE: "customers:manage",

  POLICIES_VIEW: "policies:view",
  POLICIES_CREATE: "policies:create",
  POLICIES_EDIT: "policies:edit",
  POLICIES_DELETE: "policies:delete",

  CLAIMS_VIEW: "claims:view",
  CLAIMS_CREATE: "claims:create",
  CLAIMS_REVIEW: "claims:review",
  CLAIMS_APPROVE: "claims:approve",

  QUOTES_VIEW: "quotes:view",
  QUOTES_MANAGE: "quotes:manage",

  PAYMENTS_VIEW: "payments:view",
  PAYMENTS_PROCESS: "payments:process",
  PAYMENTS_REFUND: "payments:refund",
  INVOICES_VIEW: "invoices:view",
  INVOICES_MANAGE: "invoices:manage",

  PRODUCTS_MANAGE: "products:manage",
  CMS_MANAGE: "cms:manage",
  BLOG_MANAGE: "blog:manage",
  MEDIA_MANAGE: "media:manage",
  TESTIMONIALS_MANAGE: "testimonials:manage",
  PARTNERS_MANAGE: "partners:manage",
  FAQ_MANAGE: "faq:manage",
  FORMS_MANAGE: "forms:manage",

  LEADS_VIEW: "leads:view",
  LEADS_MANAGE: "leads:manage",
  REPORTS_VIEW: "reports:view",
  SETTINGS_MANAGE: "settings:manage",
  SEO_MANAGE: "seo:manage",
  AUDIT_VIEW: "audit:view",
  EXPORT_DATA: "export:data",
  NOTIFICATIONS_MANAGE: "notifications:manage",
  AI_ADVISOR_MANAGE: "ai-advisor:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CUSTOMER: [],
  SUPER_ADMIN: ALL,
  ADMIN: ALL,
  MANAGER: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.POLICIES_VIEW,
    PERMISSIONS.POLICIES_CREATE,
    PERMISSIONS.POLICIES_EDIT,
    PERMISSIONS.CLAIMS_VIEW,
    PERMISSIONS.CLAIMS_REVIEW,
    PERMISSIONS.QUOTES_VIEW,
    PERMISSIONS.QUOTES_MANAGE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.CMS_MANAGE,
    PERMISSIONS.BLOG_MANAGE,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.AI_ADVISOR_MANAGE,
  ],
  FINANCE: [
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.POLICIES_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_PROCESS,
    PERMISSIONS.PAYMENTS_REFUND,
    PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.INVOICES_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.EXPORT_DATA,
  ],
  CLAIMS_OFFICER: [
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.POLICIES_VIEW,
    PERMISSIONS.CLAIMS_VIEW,
    PERMISSIONS.CLAIMS_CREATE,
    PERMISSIONS.CLAIMS_REVIEW,
    PERMISSIONS.CLAIMS_APPROVE,
    PERMISSIONS.QUOTES_VIEW,
  ],
  MARKETING: [
    PERMISSIONS.CMS_MANAGE,
    PERMISSIONS.SEO_MANAGE,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.BLOG_MANAGE,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.TESTIMONIALS_MANAGE,
    PERMISSIONS.PARTNERS_MANAGE,
    PERMISSIONS.FAQ_MANAGE,
    PERMISSIONS.FORMS_MANAGE,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_MANAGE,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.AI_ADVISOR_MANAGE,
  ],
  AGENT: [
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.POLICIES_VIEW,
    PERMISSIONS.POLICIES_CREATE,
    PERMISSIONS.QUOTES_VIEW,
    PERMISSIONS.QUOTES_MANAGE,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_MANAGE,
    PERMISSIONS.PRODUCTS_MANAGE,
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function isStaffRole(role: UserRole): boolean {
  return role !== "CUSTOMER";
}

export function canAccessAdmin(role: UserRole): boolean {
  return isStaffRole(role);
}
