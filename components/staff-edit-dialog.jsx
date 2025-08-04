"use client";

import React, {useEffect, useState} from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {getGrades, getTeams} from "@/lib/api-client";
import {toast} from "sonner";
import {StaffForm} from "./staff-form";

export function StaffEditDialog({open, onOpenChange, staffToEdit, allStaff, onSaveSuccess}) {
    const [grades, setGrades] = useState([]);
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            if (open) {
                try {
                    const [gradesData, teamsData] = await Promise.all([getGrades(), getTeams()]);
                    setGrades(gradesData);
                    setTeams(teamsData);
                } catch (error) {
                    toast.error("Failed to load necessary data for the form.");
                }
            }
        };
        fetchDropdownData();
    }, [open]);

    const handleSave = () => {
        onOpenChange(false); // Close dialog
        if (onSaveSuccess) {
            onSaveSuccess(); // Refresh list
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Staff Member</DialogTitle>
                    <DialogDescription>
                        Update the staff member's details below.
                    </DialogDescription>
                </DialogHeader>
                <StaffForm
                    staffToEdit={staffToEdit}
                    allStaff={allStaff}
                    grades={grades}
                    teams={teams}
                    onSave={handleSave}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
