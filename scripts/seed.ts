import { PrismaClient } from '@/app/generated/prisma'
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    try {
        // Get user credentials from environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Admin User';

        const editorEmail = process.env.EDITOR_EMAIL;
        const editorPassword = process.env.EDITOR_PASSWORD;
        const editorName = process.env.EDITOR_NAME || 'Content Editor';

        // Validate required environment variables
        if (!adminEmail || !adminPassword) {
            throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
        }

        if (!editorEmail || !editorPassword) {
            throw new Error('EDITOR_EMAIL and EDITOR_PASSWORD environment variables are required');
        }

        console.log('Environment variables loaded successfully');

        // Create default year if it doesn't exist
        const year2025 = await prisma.year.upsert({
            where: { name: '2025' },
            update: {},
            create: {
                name: '2025'
            }
        });

        console.log('Year created/updated:', year2025.name);

        // Create admin user if it doesn't exist
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!existingAdmin) {
            const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
            const adminUser = await prisma.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedAdminPassword,
                    role: 'ADMIN',
                    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop'
                }
            });
            console.log('Admin user created:', adminUser.email);
        } else {
            console.log('Admin user already exists:', existingAdmin.email);
        }

        // Create editor user if it doesn't exist
        const existingEditor = await prisma.user.findUnique({
            where: { email: editorEmail }
        });

        if (!existingEditor) {
            const hashedEditorPassword = await bcrypt.hash(editorPassword, 10);
            const editorUser = await prisma.user.create({
                data: {
                    name: editorName,
                    email: editorEmail,
                    password: hashedEditorPassword,
                    role: 'EDITOR',
                    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=100&h=100&fit=crop'
                }
            });
            console.log('Editor user created:', editorUser.email);
        } else {
            console.log('Editor user already exists:', existingEditor.email);
        }

        // Create sample speakers if they don't exist
        const existingSpeaker1 = await prisma.speaker.findFirst({
            where: {
                name: 'Dr. Sarah Johnson',
                yearId: year2025.id
            }
        });

        let speaker1;
        if (!existingSpeaker1) {
            speaker1 = await prisma.speaker.create({
                data: {
                    name: 'Dr. Sarah Johnson',
                    title: 'Cloud Solutions Architect',
                    bio: 'Dr. Sarah Johnson is a renowned cloud computing expert with over 15 years of experience in enterprise architecture and AWS solutions.',
                    photoUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=400&h=400&fit=crop',
                    keyNote: 'The Future of Cloud Computing in Africa',
                    yearId: year2025.id
                }
            });
            console.log('Speaker 1 created:', speaker1.name);
        } else {
            speaker1 = existingSpeaker1;
            console.log('Speaker 1 already exists:', speaker1.name);
        }

        const existingSpeaker2 = await prisma.speaker.findFirst({
            where: {
                name: 'Michael Chen',
                yearId: year2025.id
            }
        });

        let speaker2;
        if (!existingSpeaker2) {
            speaker2 = await prisma.speaker.create({
                data: {
                    name: 'Michael Chen',
                    title: 'Senior DevOps Engineer',
                    bio: 'Michael specializes in serverless architectures and has helped numerous companies migrate to cloud-native solutions.',
                    photoUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?w=400&h=400&fit=crop',
                    yearId: year2025.id
                }
            });
            console.log('Speaker 2 created:', speaker2.name);
        } else {
            speaker2 = existingSpeaker2;
            console.log('Speaker 2 already exists:', speaker2.name);
        }

        // Create sample agenda items if they don't exist
        const existingAgenda1 = await prisma.agenda.findFirst({
            where: {
                titleEn: 'Opening Keynote: The Future of Cloud in Africa',
                yearId: year2025.id
            }
        });

        if (!existingAgenda1) {
            await prisma.agenda.create({
                data: {
                    titleEn: 'Opening Keynote: The Future of Cloud in Africa',
                    titleFr: 'Keynote d\'ouverture : L\'avenir du cloud en Afrique',
                    descriptionEn: 'Explore how cloud computing is transforming businesses across Africa',
                    descriptionFr: 'Découvrez comment l\'informatique en nuage transforme les entreprises à travers l\'Afrique',
                    startTime: new Date('2025-03-15T09:00:00Z'),
                    endTime: new Date('2025-03-15T10:00:00Z'),
                    speakerId: speaker1.id,
                    yearId: year2025.id,
                    location: 'Main Auditorium',
                    type: 'keynote',
                    published: true
                }
            });
            console.log('Agenda item 1 created');
        } else {
            console.log('Agenda item 1 already exists');
        }

        const existingAgenda2 = await prisma.agenda.findFirst({
            where: {
                titleEn: 'Building Serverless Applications with AWS Lambda',
                yearId: year2025.id
            }
        });

        if (!existingAgenda2) {
            await prisma.agenda.create({
                data: {
                    titleEn: 'Building Serverless Applications with AWS Lambda',
                    titleFr: 'Construire des applications serverless avec AWS Lambda',
                    descriptionEn: 'Learn how to build scalable serverless applications using AWS Lambda and related services',
                    descriptionFr: 'Apprenez à créer des applications serverless évolutives en utilisant AWS Lambda et les services associés',
                    startTime: new Date('2025-03-15T10:30:00Z'),
                    endTime: new Date('2025-03-15T11:30:00Z'),
                    speakerId: speaker2.id,
                    yearId: year2025.id,
                    location: 'Room 101',
                    type: 'session',
                    published: true
                }
            });
            console.log('Agenda item 2 created');
        } else {
            console.log('Agenda item 2 already exists');
        }

        // Create additional sample agenda items
        const existingAgenda3 = await prisma.agenda.findFirst({
            where: {
                titleEn: 'Networking Break and Coffee',
                yearId: year2025.id
            }
        });

        if (!existingAgenda3) {
            await prisma.agenda.create({
                data: {
                    titleEn: 'Networking Break and Coffee',
                    titleFr: 'Pause réseau et café',
                    descriptionEn: 'Take a break, network with fellow attendees, and enjoy some refreshments',
                    descriptionFr: 'Prenez une pause, réseauter avec d\'autres participants et profitez de rafraîchissements',
                    startTime: new Date('2025-03-15T11:30:00Z'),
                    endTime: new Date('2025-03-15T12:00:00Z'),
                    speakerId: speaker1.id, // Can use any speaker ID for breaks
                    yearId: year2025.id,
                    location: 'Main Hall',
                    type: 'break',
                    published: true
                }
            });
            console.log('Agenda item 3 created');
        } else {
            console.log('Agenda item 3 already exists');
        }

        // Check if gallery images already exist
        const existingGalleryImages = await prisma.galleryImage.findMany({
            where: {
                yearId: year2025.id
            }
        });

        if (existingGalleryImages.length === 0) {
            // Create sample gallery images only if none exist for this year
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
                    },
                    {
                        imageUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=600&h=400&fit=crop',
                        caption: 'Networking Session',
                        category: 'networking',
                        yearId: year2025.id
                    }
                ]
            });
            console.log('Gallery images created');
        } else {
            console.log('Gallery images already exist:', existingGalleryImages.length, 'images found');
        }

        console.log('Database seeding completed successfully!');

    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });