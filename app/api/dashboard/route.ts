import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.success) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const yearId = searchParams.get('yearId');

        if (!yearId) {
            return NextResponse.json(
                { error: 'Year ID is required' },
                { status: 400 }
            );
        }

        // Safe counting function that handles missing models
        const safeCount = async (model: any, where: any = {}) => {
            try {
                if (model && typeof model.count === 'function') {
                    return await model.count({ where });
                }
                return 0;
            } catch (error) {
                console.warn(`Count failed for model:`, error);
                return 0;
            }
        };

        // Safe findMany function that handles missing models
        const safeFindMany = async (model: any, options: any = {}) => {
            try {
                if (model && typeof model.findMany === 'function') {
                    return await model.findMany(options);
                }
                return [];
            } catch (error) {
                console.warn(`FindMany failed for model:`, error);
                return [];
            }
        };

        // Get counts for all entities with safe error handling
        const counts = await Promise.allSettled([
            // Core models that should exist
            safeCount(db.speaker, { yearId }),
            safeCount(db.agenda, { yearId }),
            safeCount(db.galleryImage, { yearId }),
            safeCount(db.sponsor, { yearId }),

            // Optional models - handle gracefully if they don't exist
            safeCount(db.organizer, { yearId }).catch(() => 0),
            safeCount(db.volunteer, { yearId }).catch(() => 0),
            safeCount(db.venue, { yearId }).catch(() => 0),
            safeCount(db.contactInfo, { yearId }).catch(() => 0),
            safeCount(db.generalSetting, { yearId }).catch(() => 0)
        ]);

        // Extract counts from settled promises
        const [
            speakersCount,
            agendaCount,
            galleryCount,
            sponsorsCount,
            organizersCount,
            volunteersCount,
            venueCount,
            contactCount,
            settingsCount
        ] = counts.map(result =>
            result.status === 'fulfilled' ? result.value : 0
        );

        // Get recent activity with safe error handling
        const recentActivities = await Promise.allSettled([
            // Speakers activity
            safeFindMany(db.speaker, {
                where: { yearId },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: { name: true, createdAt: true }
            }),

            // Agenda activity
            safeFindMany(db.agendaItem, {
                where: { yearId },
                orderBy: { createdAt: 'desc' },
                take: 2,
                select: { title: true, createdAt: true }
            }),

            // Gallery activity
            safeFindMany(db.galleryImage, {
                where: { yearId },
                orderBy: { createdAt: 'desc' },
                take: 2,
                select: { title: true, createdAt: true }
            }),

            // Sponsors activity
            safeFindMany(db.sponsor, {
                where: { yearId },
                orderBy: { createdAt: 'desc' },
                take: 2,
                select: { name: true, createdAt: true }
            })
        ]);

        // Extract recent activities from settled promises
        const [
            recentSpeakers,
            recentAgenda,
            recentGallery,
            recentSponsors
        ] = recentActivities.map(result =>
            result.status === 'fulfilled' ? result.value : []
        );

        // Combine and sort recent activity
        const recentActivity = [
            ...(recentSpeakers || []).map((item: any) => ({
                action: 'Speaker added',
                item: item.name,
                time: item.createdAt,
                type: 'speaker' as const
            })),
            ...(recentAgenda || []).map((item: any) => ({
                action: 'Agenda updated',
                item: item.title,
                time: item.createdAt,
                type: 'agenda' as const
            })),
            ...(recentGallery || []).map((item: any) => ({
                action: 'Gallery updated',
                item: item.title || 'New image',
                time: item.createdAt,
                type: 'gallery' as const
            })),
            ...(recentSponsors || []).map((item: any) => ({
                action: 'Sponsor added',
                item: item.name,
                time: item.createdAt,
                type: 'sponsor' as const
            }))
        ]
            .filter(activity => activity.item) // Filter out empty items
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 6); // Get top 6 most recent

        // Get completion status
        const completionStatus = {
            venue: venueCount > 0,
            contact: contactCount > 0,
            settings: settingsCount > 0,
            speakers: speakersCount > 0,
            sponsors: sponsorsCount > 0,
            agenda: agendaCount > 0
        };

        const dashboardData = {
            stats: {
                speakers: speakersCount || 0,
                agenda: agendaCount || 0,
                gallery: galleryCount || 0,
                sponsors: sponsorsCount || 0,
                organizers: organizersCount || 0,
                volunteers: volunteersCount || 0
            },
            recentActivity,
            completionStatus,
            totals: {
                speakers: speakersCount || 0,
                agenda: agendaCount || 0,
                gallery: galleryCount || 0,
                sponsors: sponsorsCount || 0,
                organizers: organizersCount || 0,
                volunteers: volunteersCount || 0
            }
        };

        return NextResponse.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}