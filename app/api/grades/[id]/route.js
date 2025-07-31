import {NextResponse} from "next/server";
import {
    deleteGrade as dbDeleteGrade,
    getGradeById,
    updateGrade as dbUpdateGrade,
} from "@/lib/database";

export async function GET(request, {params}) {
    try {
        const {id} = params;
        const grade = await getGradeById(id);

        if (!grade) {
            return NextResponse.json({message: "Grade not found"}, {status: 404});
        }

        return NextResponse.json(grade, {status: 200});
    } catch (error) {
        console.error("Error fetching grade:", error);
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500}
        );
    }
}

export async function PUT(request, {params}) {
    try {
        const {id} = params;
        const {name} = await request.json();

        if (!name) {
            return NextResponse.json({message: "Name is required"}, {status: 400});
        }

        const updatedGrade = await dbUpdateGrade(id, {name});
        if (!updatedGrade) {
            return NextResponse.json({message: "Grade not found"}, {status: 404});
        }
        return NextResponse.json(updatedGrade, {status: 200});
    } catch (error) {
        console.error("Error updating grade:", error);
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500},
        );
    }
}

export async function DELETE(request, {params}) {
    try {
        const {id} = params;
        const deleted = await dbDeleteGrade(id);
        if (!deleted) {
            return NextResponse.json({message: "Grade not found"}, {status: 404});
        }
        return NextResponse.json({message: "Grade deleted"}, {status: 200});
    } catch (error) {
        console.error("Error deleting grade:", error);
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500},
        );
    }
}