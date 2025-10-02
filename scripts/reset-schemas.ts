// reset-and-recreate-agenda.ts
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

async function resetAndRecreate() {
    try {
        console.log('🗑️  Deleting all agenda items...')

        const deleteResult = await prisma.agenda.deleteMany({})
        console.log(`✅ Deleted ${deleteResult.count} agenda items`)

        console.log('🗑️  Deleting all speaker items...')

        const deletedSpeakers = await prisma.speaker.deleteMany({})
        console.log(`Deleted ${deletedSpeakers.count} speakers`)

    } catch (error) {
        console.error('❌ Error resetting agenda:', error)
    } finally {
        await prisma.$disconnect()
    }
}

resetAndRecreate()