import {NextRequest, NextResponse} from "next/server";
import {getNotes} from "@/lib/database";

interface RouteContext {
    params: { staffId: string };
}

export async function GET(request: NextRequest, {params}: RouteContext) {
    try {
        const {staffId} = params;
        const notes = await getNotes(staffId); // Call getNotes with staffId
        return NextResponse.json(notes, {status: 200});
    } catch (error) {
        console.error("Error fetching notes by staff ID:", error);
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500},
        );
    }
}