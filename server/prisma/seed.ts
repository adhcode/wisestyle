import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');


const prisma = new PrismaClient();

async function main() {
  const email = 'admin@wisestyle.ng';
  const plainPassword = 'adminwisestyle';
  const password = await bcrypt.hash(plainPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password, role: 'ADMIN' },
      create: {
      email,
      password,
        role: 'ADMIN',
      isEmailVerified: true,
      // add other fields if needed
      },
    });

  console.log('Admin user seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
