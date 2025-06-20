// JavaScript seed file for production compatibility
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const user = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created:', user.username);
    console.log('🌱 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('📊 Database connection closed');
  });

