import {NextResponse} from "next/server";
import {getTasksByStaffId} from "@/lib/database";

export async function GET(request, {params}) {
    try {
        const {staffId} = params;
        const tasks = await getTasksByStaffId(staffId);
        return NextResponse.json(tasks, {status: 200});
    } catch (error) {
        // Check if params exists and has staffId before trying to access it
        const staffIdForError = params ? params.staffId : "unknown";
        console.error(`Error fetching tasks for staff ${staffIdForError}:`, error);
        return NextResponse.json(
            {error: "Failed to fetch tasks"},
            {status: 500}
        );
    }
}