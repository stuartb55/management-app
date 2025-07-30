import {NextRequest, NextResponse} from "next/server";
import {getTasks} from "@/lib/database"; // Change to getTasks

interface RouteContext {
    params: { staffId: string };
}

export async function GET(request: NextRequest, {params}: RouteContext) {
    try {
        const {staffId} = params;
        const tasks = await getTasks(staffId); // Call getTasks with staffId
        return NextResponse.json(tasks, {status: 200});
    } catch (error) {
        console.error("Error fetching tasks by staff ID:", error);
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500},
        );
    }
}