import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Default test accounts for development/testing:
 *
 * Admin:  admin@test.com  / admin123456
 * User:   user@test.com   / user123456
 */
async function main() {
  // bcrypt hash with cost 10
  const adminHash = "$2a$10$fBKdBD0bt0wboswE.1WPpeV49o5f57JBcrPpMmwDu6gGw1LmSGvmS";
  const userHash = "$2a$10$uZYocgwCHUntGIMM9U1inuOaRAZaB53vbcjyV5BYMnUHeTFFHgilG";

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      passwordHash: adminHash,
      nickname: "Admin",
      status: 1,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      passwordHash: userHash,
      nickname: "测试用户",
      status: 1,
    },
  });

  console.log("Seeded test accounts:");
  console.log(`  Admin: admin@test.com / admin123456 (id: ${admin.id})`);
  console.log(`  User:  user@test.com / user123456 (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
