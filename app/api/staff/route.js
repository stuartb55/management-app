// app/api/staff/route.js
import {getStaff, addStaff} from "@/lib/database";
import {handleGetAll, handleCreate} from "@/lib/api-helpers";
import {StaffSchema} from "@/lib/schemas";

export async function GET() {
    return handleGetAll(getStaff, "staff");
}

export async function POST(request) {
    const data = await request.json();
    return handleCreate(addStaff, data, StaffSchema, "staff");
}