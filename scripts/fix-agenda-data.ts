// fix-agenda-data.ts
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

async function fixAgendaData() {
    try {
        console.log('🔧 Fixing agenda data...')

        // Get all agenda items that have the old title but null titleEn
        const agendaItems = await prisma.agenda.findMany({
            where: {
                OR: [
                    { titleEn: null },
                    { titleEn: '' }
                ],
                title: { not: null }
            }
        })

        console.log(`📝 Found ${agendaItems.length} agenda items to fix`)

        for (const item of agendaItems) {
            console.log(`🔄 Fixing item: ${item.id}`)

            await prisma.agenda.update({
                where: { id: item.id },
                data: {
                    titleEn: item.title || 'Untitled', // Use old title or default
                    titleFr: item.title || 'Untitled', // Use same as English if no French
                    descriptionEn: item.description || null,
                    descriptionFr: item.description || null, // Use same as English if no French
                }
            })

            console.log(`✅ Fixed item: ${item.id}`)
        }

        console.log('🎉 All agenda items fixed!')

    } catch (error) {
        console.error('❌ Error fixing agenda data:', error)
    } finally {
        await prisma.$disconnect()
    }
}

fixAgendaData()