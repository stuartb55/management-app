// app/api/teams/[id]/route.js
import {getTeamById, updateTeam, deleteTeam} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {TeamSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    return handleGetById(getTeamById, params.id, "team");
}

export async function PUT(request, {params}) {
    const data = await request.json();
    return handleUpdate(updateTeam, params.id, data, TeamSchema.partial(), "team");
}

export async function DELETE(request, {params}) {
    return handleDelete(deleteTeam, params.id, "team");
}