import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { resolvePgConnectionString } from "../src/lib/database-url";

const DEV_ADMIN_EMAIL = "admin@shivinsbro.co.ke";
const DEV_ADMIN_PASSWORD = "Shivinsbro@2026";

const adapter = new PrismaPg({
  connectionString: resolvePgConnectionString(),
});
const prisma = new PrismaClient({ adapter });

async function main() {
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
  console.log(`Admin user ready: ${DEV_ADMIN_EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
