// app/api/teams/route.js
import { getTeams, addTeam } from "@/lib/database";
import { handleGetAll, handleCreate } from "@/lib/api-helpers";
import { TeamSchema } from "@/lib/schemas";

export async function GET() {
    return handleGetAll(getTeams, "teams");
}

export async function POST(request) {
    const data = await request.json();
    return handleCreate(addTeam, data, TeamSchema, "team");
}