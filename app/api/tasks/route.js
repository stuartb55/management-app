// app/api/tasks/route.js
import {getTasks, addTask} from "@/lib/database";
import {handleGetAll, handleCreate} from "@/lib/api-helpers";
import {TaskSchema} from "@/lib/schemas";

export async function GET() {
    return handleGetAll(getTasks, "tasks");
}

export async function POST(request) {
    const data = await request.json();
    return handleCreate(addTask, data, TaskSchema, "task");
}