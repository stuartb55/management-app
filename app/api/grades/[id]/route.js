// app/api/grades/[id]/route.js
import {getGradeById, updateGrade, deleteGrade} from "@/lib/database";
import {handleGetById, handleUpdate, handleDelete} from "@/lib/api-helpers";
import {GradeSchema} from "@/lib/schemas";

export async function GET(request, {params}) {
    const resolvedParams = await params;
    return handleGetById(getGradeById, resolvedParams.id, "grade");
}

export async function PUT(request, {params}) {
    const resolvedParams = await params;
    const data = await request.json();
    return handleUpdate(updateGrade, resolvedParams.id, data, GradeSchema.partial(), "grade");
}

export async function DELETE(request, {params}) {
    const resolvedParams = await params;
    return handleDelete(deleteGrade, resolvedParams.id, "grade");
}