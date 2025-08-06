import React from "react";
import {getStaffById, getStaff, getNotes, getTasks} from "@/lib/database";
import {EnhancedStaffDetailsView} from "@/components/enhanced-staff-details-view";

// This remains an async Server Component
export default async function StaffDetailsPage({params}) {
    const resolvedParams = await params;
    const {id} = resolvedParams;

    // Fetch all necessary data on the server in parallel
    const [staffMember, allStaff, allNotes, allTasks] = await Promise.all([
        getStaffById(id),
        getStaff(),
        getNotes(), // Fetches all notes
        getTasks(), // Fetches all tasks
    ]);

    if (!staffMember) {
        return <div className="container mx-auto p-6">Staff member not found.</div>;
    }

    const notesForStaff = allNotes.filter(note => note.staffId === id);
    const tasksForStaff = allTasks.filter(task => task.staffId === id);

    return (
        <EnhancedStaffDetailsView
            staffMember={staffMember}
            allStaff={allStaff}
            notes={notesForStaff}
            tasks={tasksForStaff}
        />
    );
}