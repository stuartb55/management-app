// app/api/staff/[id]/route.js
import {getStaffById, updateStaff, deleteStaff} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {StaffUpdateSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    const resolvedParams = await params;
    return handleGetById(getStaffById, resolvedParams.id, "staff member");
}

export async function PUT(request, {params}) {
    const resolvedParams = await params;
    const data = await request.json();
    // Use the update schema that excludes computed fields
    return handleUpdate(updateStaff, resolvedParams.id, data, StaffUpdateSchema, "staff member");
}

export async function DELETE(request, {params}) {
    const resolvedParams = await params;
    return handleDelete(deleteStaff, resolvedParams.id, "staff member");
}