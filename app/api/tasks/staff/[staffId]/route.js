// app/api/tasks/staff/[staffId]/route.js
import {getTasksByStaffId} from "@/lib/database";
import {error, success} from "@/lib/api-helpers";

export async function GET(request, {params}) {
    try {
        const resolvedParams = await params;
        const {staffId} = resolvedParams;
        const tasks = await getTasksByStaffId(staffId);
        return success(tasks);
    } catch (err) {
        return error(`Failed to fetch tasks for staff: ${err.message}`);
    }
}