import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default year
  const year2025 = await prisma.year.upsert({
    where: { name: '2025' },
    update: {},
    create: {
      name: '2025'
    }
  });

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@awscommunity.cm' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@awscommunity.cm',
      password: hashedAdminPassword,
      role: 'ADMIN',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop'
    }
  });

  // Create editor user
  const hashedEditorPassword = await bcrypt.hash('editor123', 10);
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@awscommunity.cm' },
    update: {},
    create: {
      name: 'Content Editor',
      email: 'editor@awscommunity.cm',
      password: hashedEditorPassword,
      role: 'EDITOR',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=100&h=100&fit=crop'
    }
  });

  // Create sample speakers
  const speaker1 = await prisma.speaker.create({
    data: {
      name: 'Dr. Sarah Johnson',
      title: 'Cloud Solutions Architect',
      bio: 'Dr. Sarah Johnson is a renowned cloud computing expert with over 15 years of experience in enterprise architecture and AWS solutions.',
      photoUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=400&h=400&fit=crop',
      keyNote: 'The Future of Cloud Computing in Africa',
      yearId: year2025.id
    }
  });

  const speaker2 = await prisma.speaker.create({
    data: {
      name: 'Michael Chen',
      title: 'Senior DevOps Engineer',
      bio: 'Michael specializes in serverless architectures and has helped numerous companies migrate to cloud-native solutions.',
      photoUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?w=400&h=400&fit=crop',
      yearId: year2025.id
    }
  });

  // Create sample agenda items
  await prisma.agenda.create({
    data: {
      title: 'Opening Keynote: The Future of Cloud in Africa',
      description: 'Explore how cloud computing is transforming businesses across Africa',
      startTime: new Date('2025-03-15T09:00:00Z'),
      endTime: new Date('2025-03-15T10:00:00Z'),
      speakerId: speaker1.id,
      yearId: year2025.id
    }
  });

  await prisma.agenda.create({
    data: {
      title: 'Building Serverless Applications with AWS Lambda',
      description: 'Learn how to build scalable serverless applications',
      startTime: new Date('2025-03-15T10:30:00Z'),
      endTime: new Date('2025-03-15T11:30:00Z'),
      speakerId: speaker2.id,
      yearId: year2025.id
    }
  });

  // Create sample gallery images
  await prisma.galleryImage.createMany({
    data: [
      {
        imageUrl: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?w=600&h=400&fit=crop',
        caption: 'AWS Community Day 2024 Opening Ceremony',
        category: 'event',
        yearId: year2025.id
      },
      {
        imageUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?w=600&h=400&fit=crop',
        caption: 'Keynote Speaker Presentation',
        category: 'speakers',
        yearId: year2025.id
      }
    ]
  });

  console.log('Database seeded successfully!');
  console.log('Admin user:', adminUser.email);
  console.log('Editor user:', editorUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });