import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'EDITOR']),
    password: z.string().min(6, 'Password must be at least 6 characters').optional()
});

// Speaker schema
export const speakerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    title: z.string().min(2, 'Title is required'),
    bio: z.object({
        en: z.string().min(10, 'English bio must be at least 10 characters'),
        fr: z.string().min(10, 'French bio must be at least 10 characters')
    }),
    photoUrl: z.string().url('Invalid photo URL').optional(),
    keynote: z.boolean().default(false),
    published: z.boolean().default(false)
});

// Agenda schema
export const agendaSchema = z.object({
    title: z.object({
        en: z.string().min(2, 'English title is required'),
        fr: z.string().min(2, 'French title is required')
    }),
    description: z.object({
        en: z.string().min(10, 'English description is required'),
        fr: z.string().min(10, 'French description is required')
    }),
    startTime: z.string(),
    endTime: z.string(),
    date: z.string(),
    speakerId: z.string().optional(),
    location: z.string().min(2, 'Location is required'),
    type: z.enum(['keynote', 'session', 'break', 'networking']),
    published: z.boolean().default(false)
});

// Venue schema
export const venueSchema = z.object({
    name: z.object({
        en: z.string().min(2, 'English name is required'),
        fr: z.string().min(2, 'French name is required')
    }),
    address: z.object({
        en: z.string().min(5, 'English address is required'),
        fr: z.string().min(5, 'French address is required')
    }),
    description: z.object({
        en: z.string().min(10, 'English description is required'),
        fr: z.string().min(10, 'French description is required')
    }),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    published: z.boolean().default(false)
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type SpeakerInput = z.infer<typeof speakerSchema>;
export type AgendaInput = z.infer<typeof agendaSchema>;
export type VenueInput = z.infer<typeof venueSchema>;