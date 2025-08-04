// app/api/notes/staff/[staffId]/route.js
import {getNotesByStaffId} from "@/lib/database";
import {error, success} from "@/lib/api-helpers";

export async function GET(request, {params}) {
    try {
        const {staffId} = params;
        const notes = await getNotesByStaffId(staffId);
        return success(notes);
    } catch (err) {
        return error(`Failed to fetch notes for staff: ${err.message}`);
    }
}