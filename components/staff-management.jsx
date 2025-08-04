"use client";

import React, {useState, useEffect} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {getStaff} from "@/lib/api-client";
import {toast} from "sonner";
import LoadingSpinner from "./loading-spinner";
import Link from "next/link";
import {StaffEditDialog} from "./staff-edit-dialog";

export function StaffManagement({allStaff: initialAllStaff}) {
    const [staff, setStaff] = useState(initialAllStaff || []);
    const [editingStaff, setEditingStaff] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(!initialAllStaff);

    const refreshStaffList = async () => {
        setLoading(true);
        try {
            const staffData = await getStaff();
            setStaff(staffData);
        } catch (error) {
            console.error("Failed to refresh staff data:", error);
            toast.error("Failed to refresh staff data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!initialAllStaff) {
            refreshStaffList();
        }
    }, [initialAllStaff]);

    const openEditDialog = (staffMemberToEdit) => {
        setEditingStaff(staffMemberToEdit);
        setIsDialogOpen(true);
    };

    if (loading) {
        return <LoadingSpinner/>;
    }

    return (
        <div className="space-y-4">
            <Button asChild>
                <Link href="/staff/new">Add New Staff</Link>
            </Button>

            {staff.length === 0 && !loading && (
                <p className="text-muted-foreground">No staff members found. Add a new one!</p>
            )}

            {staff.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Job Role</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Line Manager</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    <Link href={`/staff/${s.id}`}
                                          className="font-medium hover:underline">{s.name}</Link>
                                    <div className="text-sm text-muted-foreground">{s.email}</div>
                                </TableCell>
                                <TableCell>{s.jobRole}</TableCell>
                                <TableCell>{s.teamName || "N/A"}</TableCell>
                                <TableCell>
                                    {s.lineManagerName || "N/A"}
                                </TableCell>
                                <TableCell className="space-x-2 text-right">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(s)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <StaffEditDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                staffToEdit={editingStaff}
                allStaff={staff}
                onSaveSuccess={refreshStaffList}
            />
        </div>
    );
}
