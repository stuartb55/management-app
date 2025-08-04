// app/api/tasks/[id]/route.js
import {getTaskById, updateTask, deleteTask} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {TaskSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    return handleGetById(getTaskById, params.id, "task");
}

export async function PUT(request, {params}) {
    const data = await request.json();
    return handleUpdate(updateTask, params.id, data, TaskSchema.partial(), "task");
}

export async function DELETE(request, {params}) {
    return handleDelete(deleteTask, params.id, "task");
}