// app/api/staff/[id]/route.js
import {getStaffById, updateStaff, deleteStaff} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {StaffSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    return handleGetById(getStaffById, params.id, "staff member");
}

export async function PUT(request, {params}) {
    const data = await request.json();
    return handleUpdate(updateStaff, params.id, data, StaffSchema.partial(), "staff member");
}

export async function DELETE(request, {params}) {
    return handleDelete(deleteStaff, params.id, "staff member");
}