import React from "react";
import {getStaff, getGrades, getTeams} from "@/lib/database";
import {StaffForm} from "@/components/staff-form";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default async function NewStaffPage() {
    const [allStaff, grades, teams] = await Promise.all([
        getStaff(),
        getGrades(),
        getTeams(),
    ]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/staff">Staff</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbPage>New Staff Member</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">Add New Staff Member</CardTitle>
                    <CardDescription>
                        Fill in the details below. Required fields are marked with an asterisk.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StaffForm allStaff={allStaff} grades={grades} teams={teams}/>
                </CardContent>
            </Card>
        </div>
    );
}
