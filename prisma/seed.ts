import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin1234!", 12);
  const studentPassword = await bcrypt.hash("Student1234!", 12);

  await prisma.user.upsert({
    where: { email: "admin@crna.local" },
    update: {},
    create: {
      email: "admin@crna.local",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "student@crna.local" },
    update: {},
    create: {
      email: "student@crna.local",
      password: studentPassword,
      name: "Demo Student",
      role: "STUDENT",
    },
  });

  console.log("✅ Seed complete");
  console.log("  admin@crna.local   / Admin1234!");
  console.log("  student@crna.local / Student1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
