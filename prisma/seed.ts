import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial database data...');

  const adminPassword = await bcrypt.hash('admin123456', 10);
  const modPassword = await bcrypt.hash('mod123456', 10);
  const memberPassword = await bcrypt.hash('member123456', 10);

  // 1. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pirojpur-alumni.org' },
    update: {},
    create: {
      email: 'admin@pirojpur-alumni.org',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'System Admin',
          batchYear: 2005,
          occupation: 'Administrator',
          organization: 'Pirojpur Govt High School Alumni',
          verifiedAlumni: true,
        },
      },
    },
  });

  // 2. Create Moderator
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@pirojpur-alumni.org' },
    update: {},
    create: {
      email: 'moderator@pirojpur-alumni.org',
      passwordHash: modPassword,
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Senior Moderator',
          batchYear: 2010,
          occupation: 'Software Engineer',
          organization: 'Tech Alumni',
          verifiedAlumni: true,
        },
      },
    },
  });

  // 3. Create Verified Member
  const verifiedMember = await prisma.user.upsert({
    where: { email: 'verified@pirojpur-alumni.org' },
    update: {},
    create: {
      email: 'verified@pirojpur-alumni.org',
      passwordHash: memberPassword,
      role: Role.MEMBER,
      status: UserStatus.APPROVED,
      emailVerified: true,
      profile: {
        create: {
          fullName: 'Verified Alumni Member',
          batchYear: 2015,
          occupation: 'Doctor',
          organization: 'Dhaka Medical College',
          verifiedAlumni: true,
        },
      },
    },
  });

  console.log('✅ Seeding completed!');
  console.log('Admin:', admin.email);
  console.log('Moderator:', moderator.email);
  console.log('Verified Member:', verifiedMember.email);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
