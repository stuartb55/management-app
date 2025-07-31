import {NextResponse} from "next/server";
import {getNotes} from "@/lib/database";

export async function GET(request, {params}) {
    try {
        const {staffId} = params;
        const notes = await getNotes(staffId);
        return NextResponse.json(notes, {status: 200});
    } catch (error) {
        console.error("Error fetching notes by staff ID:", error);
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500},
        );
    }
}