import {NextResponse} from "next/server";
import {getTasks} from "@/lib/database";

export async function GET(request, {params}) {
    try {
        const {staffId} = params;
        const tasks = await getTasks(staffId);
        return NextResponse.json(tasks, {status: 200});
    } catch (error) {
        console.error("Error fetching tasks by staff ID:", error);
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500},
        );
    }
}