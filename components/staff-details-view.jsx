"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {StaffDetails} from "@/components/staff-details";
import {StaffEditDialog} from "@/components/staff-edit-dialog";
import {NotesManagement} from "@/components/notes-management"; // Corrected import
import {TaskManagement} from "@/components/task-management";   // Corrected import
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export function StaffDetailsView({staffMember, allStaff, notes, tasks}) {
    const router = useRouter();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleSaveSuccess = () => {
        setIsEditDialogOpen(false);
        router.refresh();
    };

    return (
        <>
            <div className="container mx-auto p-6 space-y-8">
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
                            <BreadcrumbPage>{staffMember.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <StaffDetails
                    staffMember={staffMember}
                    onEditClick={() => setIsEditDialogOpen(true)}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Corrected component name */}
                            <NotesManagement staffId={staffMember.id} initialNotes={notes}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Corrected component name */}
                            <TaskManagement staffId={staffMember.id} initialTasks={tasks}/>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <StaffEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                staffToEdit={staffMember}
                allStaff={allStaff}
                onSaveSuccess={handleSaveSuccess}
            />
        </>
    );
}