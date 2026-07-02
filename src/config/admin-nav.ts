import type { Permission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions";

export interface AdminNavItem {
  href: string;
  label: string;
  permission?: Permission;
  group?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", group: "Overview" },
  { href: "/admin/users", label: "Staff Users", permission: PERMISSIONS.USERS_VIEW, group: "People" },
  { href: "/admin/customers", label: "Customers", permission: PERMISSIONS.CUSTOMERS_VIEW, group: "People" },
  { href: "/admin/policies", label: "Policies", permission: PERMISSIONS.POLICIES_VIEW, group: "Insurance" },
  { href: "/admin/products", label: "Products", permission: PERMISSIONS.PRODUCTS_MANAGE, group: "Insurance" },
  { href: "/admin/premium-calculator", label: "Premium Calculator", permission: PERMISSIONS.PRODUCTS_MANAGE, group: "Insurance" },
  { href: "/admin/applications", label: "Applications", permission: PERMISSIONS.QUOTES_VIEW, group: "Insurance" },
  { href: "/admin/orders", label: "Orders", permission: PERMISSIONS.PAYMENTS_VIEW, group: "Insurance" },
  { href: "/admin/claims", label: "Claims", permission: PERMISSIONS.CLAIMS_VIEW, group: "Insurance" },
  { href: "/admin/payments", label: "Payments", permission: PERMISSIONS.PAYMENTS_VIEW, group: "Finance" },
  { href: "/admin/invoices", label: "Invoices", permission: PERMISSIONS.INVOICES_VIEW, group: "Finance" },
  { href: "/admin/leads", label: "Leads", permission: PERMISSIONS.LEADS_VIEW, group: "Sales" },
  { href: "/admin/careers", label: "Careers", permission: PERMISSIONS.LEADS_VIEW, group: "Sales" },
  { href: "/admin/forms", label: "Forms", permission: PERMISSIONS.FORMS_MANAGE, group: "Content" },
  { href: "/admin/blog", label: "Blog", permission: PERMISSIONS.BLOG_MANAGE, group: "Content" },
  { href: "/admin/media", label: "Media", permission: PERMISSIONS.MEDIA_MANAGE, group: "Content" },
  { href: "/admin/testimonials", label: "Testimonials", permission: PERMISSIONS.TESTIMONIALS_MANAGE, group: "Content" },
  { href: "/admin/partners", label: "Partners", permission: PERMISSIONS.PARTNERS_MANAGE, group: "Content" },
  { href: "/admin/statistics", label: "Statistics", permission: PERMISSIONS.CMS_MANAGE, group: "Content" },
  { href: "/admin/faqs", label: "FAQ", permission: PERMISSIONS.FAQ_MANAGE, group: "Content" },
  { href: "/admin/sections", label: "Website Builder", permission: PERMISSIONS.CMS_MANAGE, group: "Content" },
  { href: "/admin/pages", label: "CMS Pages", permission: PERMISSIONS.CMS_MANAGE, group: "Content" },
  { href: "/admin/seo", label: "SEO", permission: PERMISSIONS.SEO_MANAGE, group: "Content" },
  { href: "/admin/notifications", label: "Notifications", permission: PERMISSIONS.NOTIFICATIONS_MANAGE, group: "System" },
  { href: "/admin/ai-advisor", label: "AI Advisor", permission: PERMISSIONS.AI_ADVISOR_MANAGE, group: "System" },
  { href: "/admin/contact", label: "Contact Inbox", permission: PERMISSIONS.LEADS_VIEW, group: "Sales" },
  { href: "/admin/reports", label: "Reports", permission: PERMISSIONS.REPORTS_VIEW, group: "System" },
  { href: "/admin/audit-logs", label: "Audit Logs", permission: PERMISSIONS.AUDIT_VIEW, group: "System" },
  { href: "/admin/settings", label: "Settings", permission: PERMISSIONS.SETTINGS_MANAGE, group: "System" },
];
