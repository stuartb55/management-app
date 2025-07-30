import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {GradeManagement} from "@/components/admin/grade-management";
import {TeamManagement} from "@/components/admin/team-management";
import {getGrades, getTeams} from "@/lib/api-client";
import {Grade, Team} from "@/lib/types";
import {Suspense} from "react";
import LoadingSpinner from "@/components/loading-spinner";

export default async function AdminPage() {
    let initialGrades: Grade[] = [];
    let initialTeams: Team[] = [];
    let error: string | null = null;

    try {
        [initialGrades, initialTeams] = await Promise.all([getGrades(), getTeams()]);
    } catch (err) {
        console.error("Failed to fetch initial admin data:", err);
        error = "Failed to load admin data. Please try again.";
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center justify-center p-8 text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Grade Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<LoadingSpinner/>}>
                            <GradeManagement initialGrades={initialGrades}/>
                        </Suspense>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Team Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<LoadingSpinner/>}>
                            <TeamManagement initialTeams={initialTeams}/>
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}