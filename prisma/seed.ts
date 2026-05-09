import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { username },
    update: { password: hash },
    create: { username, password: hash },
  });

  console.log(`Admin user '${username}' seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
