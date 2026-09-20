import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('No seed data configured. Database remains unchanged.');
}

main()
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
