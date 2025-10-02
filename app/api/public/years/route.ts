import {db} from "@/lib/db";
import {NextResponse} from "next/server";

export async function GET() {
    try {
        const years = await db.year.findMany({
            orderBy: { name: 'desc' }
        });

        return NextResponse.json(years);
    } catch (error) {
        console.error('Error fetching years:', error);
        return NextResponse.json(
            { error: 'Failed to fetch years' },
            { status: 500 }
        );
    }
}