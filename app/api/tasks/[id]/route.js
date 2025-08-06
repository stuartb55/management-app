// app/api/tasks/[id]/route.js
import {getTaskById, updateTask, deleteTask} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {TaskSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    const resolvedParams = await params;
    return handleGetById(getTaskById, resolvedParams.id, "task");
}

export async function PUT(request, {params}) {
    const resolvedParams = await params;
    const data = await request.json();
    return handleUpdate(updateTask, resolvedParams.id, data, TaskSchema.partial(), "task");
}

export async function DELETE(request, {params}) {
    const resolvedParams = await params;
    return handleDelete(deleteTask, resolvedParams.id, "task");
}