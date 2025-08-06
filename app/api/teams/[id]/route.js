// app/api/teams/[id]/route.js
import {getTeamById, updateTeam, deleteTeam} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {TeamSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    const resolvedParams = await params;
    return handleGetById(getTeamById, resolvedParams.id, "team");
}

export async function PUT(request, {params}) {
    const resolvedParams = await params;
    const data = await request.json();
    return handleUpdate(updateTeam, resolvedParams.id, data, TeamSchema.partial(), "team");
}

export async function DELETE(request, {params}) {
    const resolvedParams = await params;
    return handleDelete(deleteTeam, resolvedParams.id, "team");
}