import {NextResponse} from "next/server";
import {getTasks, addTask} from "@/lib/database";

export async function GET() {
    try {
        console.log("Fetching all tasks...");
        const tasks = await getTasks();
        console.log(`Successfully fetched ${tasks.length} tasks`);
        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Error in GET /api/tasks:", error);
        return NextResponse.json({error: "Failed to fetch tasks"}, {status: 500});
    }
}

export async function POST(request) {
    try {
        console.log("Creating new task...");
        const data = await request.json();

        const newTask = await addTask(data);
        if (newTask) {
            console.log(`Successfully created task: ${newTask.title}`);
            return NextResponse.json(newTask, {status: 201});
        } else {
            console.error("Failed to create task - no result returned");
            return NextResponse.json({error: "Failed to create task"}, {status: 500});
        }
    } catch (error) {
        console.error("Error in POST /api/tasks:", error);
        return NextResponse.json({error: "Failed to create task"}, {status: 500});
    }
}