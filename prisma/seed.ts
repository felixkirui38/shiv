import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { resolvePgConnectionString } from "../src/lib/database-url";
import { seedProducts } from "./seed-products";

const DEV_ADMIN_EMAIL = "admin@shivinsbro.co.ke";
const DEV_ADMIN_PASSWORD = "Shivinsbro@2026";

const adapter = new PrismaPg({
  connectionString: resolvePgConnectionString(),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding dev admin user...");
  const passwordHash = await bcrypt.hash(DEV_ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: DEV_ADMIN_EMAIL },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      firstName: "Shiv",
      lastName: "Admin",
    },
    create: {
      email: DEV_ADMIN_EMAIL,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      firstName: "Shiv",
      lastName: "Admin",
    },
  });
  console.log(`Dev admin ready: ${DEV_ADMIN_EMAIL}`);

  console.log("Seeding insurance products...");
  await seedProducts(prisma);

  const { seedPremiumFormulas } = await import("./seed-premium-formulas");
  await seedPremiumFormulas(prisma);

  const { seedPurchaseForms } = await import("./seed-purchase-forms");
  await seedPurchaseForms(prisma);

  const permissions = [
    { name: "users:view", module: "users", description: "View users" },
    { name: "users:create", module: "users", description: "Create users" },
    { name: "users:edit", module: "users", description: "Edit users" },
    { name: "users:delete", module: "users", description: "Delete users" },
    { name: "policies:view", module: "policies", description: "View policies" },
    { name: "products:manage", module: "products", description: "Manage insurance products" },
    { name: "claims:view", module: "claims", description: "View claims" },
    { name: "claims:approve", module: "claims", description: "Approve claims" },
    { name: "payments:view", module: "payments", description: "View payments" },
    { name: "payments:refund", module: "payments", description: "Process refunds" },
    { name: "cms:manage", module: "cms", description: "Manage CMS content" },
    { name: "reports:view", module: "reports", description: "View reports" },
    { name: "settings:manage", module: "settings", description: "Manage settings" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: perm,
      create: perm,
    });
  }

  const cmsPages = [
    { slug: "about", title: "About Us", isPublished: true },
    { slug: "privacy", title: "Privacy Policy", isPublished: true },
    { slug: "terms", title: "Terms of Service", isPublished: true },
    { slug: "claims", title: "Claims Process", isPublished: true },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  const { defaultSiteNavigation } = await import("../src/config/navigation.defaults");
  await prisma.siteSetting.upsert({
    where: { key: "site_navigation" },
    update: { value: defaultSiteNavigation as object, group: "navigation" },
    create: {
      key: "site_navigation",
      value: defaultSiteNavigation as object,
      group: "navigation",
    },
  });

  const { defaultHomepageContent } = await import("../src/config/homepage.defaults");
  await prisma.siteSetting.upsert({
    where: { key: "homepage_content" },
    update: { value: defaultHomepageContent as object, group: "homepage" },
    create: {
      key: "homepage_content",
      value: defaultHomepageContent as object,
      group: "homepage",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
