// app/api/grades/route.js
import {getGrades, addGrade} from "@/lib/database";
import {handleGetAll, handleCreate} from "@/lib/api-helpers";
import {GradeSchema} from "@/lib/schemas";

export async function GET() {
    return handleGetAll(getGrades, "grades");
}

export async function POST(request) {
    const data = await request.json();
    return handleCreate(addGrade, data, GradeSchema, "grade");
}