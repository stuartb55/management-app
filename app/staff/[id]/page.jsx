import React from "react";
// Import from both database and api-client as needed
import {getStaffById, getStaff} from "@/lib/database";
import {getNotes, getTasks} from "@/lib/api-client";
import {StaffDetailsView} from "@/components/staff-details-view";

// This remains an async Server Component
export default async function StaffDetailsPage({params}) {
    const {id} = params;

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

    // Filter the notes and tasks for the specific staff member
    const notesForStaff = allNotes.filter(note => note.staffId === id);
    const tasksForStaff = allTasks.filter(task => task.staffId === id);

    // Pass the correctly filtered data down to the client component
    return (
        <StaffDetailsView
            staffMember={staffMember}
            allStaff={allStaff}
            notes={notesForStaff}
            tasks={tasksForStaff}
        />
    );
}