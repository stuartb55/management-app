// app/api/grades/[id]/route.js
import {getGradeById, updateGrade, deleteGrade} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {GradeSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    return handleGetById(getGradeById, params.id, "grade");
}

export async function PUT(request, {params}) {
    const data = await request.json();
    return handleUpdate(updateGrade, params.id, data, GradeSchema.partial(), "grade");
}

export async function DELETE(request, {params}) {
    return handleDelete(deleteGrade, params.id, "grade");
}