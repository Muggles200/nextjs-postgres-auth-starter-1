import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt-ts';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminPassword = 'admin123'; // In production, use a secure password
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(adminPassword, salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      name: 'Admin User',
      bio: 'System Administrator',
    },
  });

  // Create default settings for admin
  await prisma.userSettings.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      profileVisibility: true,
      activitySharing: true,
      dataCollection: false,
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
    },
  });

  // Create some sample activities for admin
  const activities = [
    {
      userId: admin.id,
      type: 'login',
      description: 'Successfully logged in to the system',
      metadata: { ip: '127.0.0.1', browser: 'Chrome' },
    },
    {
      userId: admin.id,
      type: 'profile_update',
      description: 'Updated profile information',
      metadata: { fields: ['name', 'bio'] },
    },
    {
      userId: admin.id,
      type: 'settings_change',
      description: 'Modified notification preferences',
      metadata: { changes: ['emailNotifications', 'pushNotifications'] },
    },
  ];

  for (const activity of activities) {
    await prisma.userActivity.create({
      data: activity,
    });
  }

  // Create default application settings
  const appSettings = [
    { key: 'siteName', value: 'Next.js Starter' },
    { key: 'siteDescription', value: 'A Next.js starter with PostgreSQL' },
    { key: 'maintenanceMode', value: 'false' },
    { key: 'twoFactorAuth', value: 'false' },
    { key: 'sessionTimeout', value: '30' },
    { key: 'smtpServer', value: '' },
    { key: 'smtpPort', value: '587' },
    { key: 'smtpUsername', value: '' },
    { key: 'smtpPassword', value: '' },
  ];

  for (const setting of appSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Database has been seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });