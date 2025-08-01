"use client";

import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation"; // Import the router
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    addStaff,
    deleteStaff,
    getGrades,
    getStaff,
    getTeams,
    updateStaff,
} from "@/lib/api-client";
import {toast} from "sonner";
import LoadingSpinner from "./loading-spinner";
import Link from "next/link";

const NONE_VALUE = "none";

export function StaffManagement({staffMember, allStaff: initialAllStaff}) {
    const router = useRouter(); // Initialise the router
    const [staff, setStaff] = useState(initialAllStaff || []);
    const [grades, setGrades] = useState([]);
    const [teams, setTeams] = useState([]);
    const [allStaff, setAllStaff] = useState(initialAllStaff || []);

    const initialNewStaffState = {
        name: "",
        email: "",
        staffNumber: "",
        jobRole: "",
        gradeId: "",
        teamId: "",
        lineManagerId: null,
    };

    const [newStaffData, setNewStaffData] = useState(initialNewStaffState);
    const [editingStaff, setEditingStaff] = useState(staffMember || null);
    const [isDialogOpen, setIsDialogOpen] = useState(!!staffMember);
    const [loading, setLoading] = useState(!initialAllStaff);

    // This function handles closing the dialog and redirecting if necessary
    const handleCloseDialog = () => {
        // If the component was loaded for a specific staff member, it's the edit page.
        // On close, redirect back to that staff member's details page.
        if (staffMember) {
            router.push(`/staff/${staffMember.id}`);
        } else {
            // Otherwise, it's a dialog on the main list page, so just close it.
            setIsDialogOpen(false);
            setEditingStaff(null);
        }
    };

    useEffect(() => {
        const fetchGradesAndTeams = async () => {
            try {
                const [gradesData, teamsData] = await Promise.all([
                    getGrades(),
                    getTeams(),
                ]);
                setGrades(gradesData);
                setTeams(teamsData);
            } catch (error) {
                console.error("Failed to fetch grades and teams:", error);
                toast.error("Failed to load grade and team data. Please try again.");
            }
        };

        fetchGradesAndTeams();
    }, []);

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            try {
                const staffData = await getStaff();
                setStaff(staffData);
                setAllStaff(staffData);
            } catch (error) {
                console.error("Failed to fetch staff data:", error);
                toast.error("Failed to load staff data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (!initialAllStaff) {
            fetchStaff();
        }
    }, [initialAllStaff]);


    const handleInputChange = (e) => {
        const {id, value} = e.target;
        const currentData = editingStaff ? editingStaff : newStaffData;
        const setter = editingStaff ? setEditingStaff : setNewStaffData;
        setter({...currentData, [id]: value});
    };

    const handleSelectChange = (id, value) => {
        const currentData = editingStaff ? editingStaff : newStaffData;
        const setter = editingStaff ? setEditingStaff : setNewStaffData;
        setter({...currentData, [id]: value});
    };

    const handleSubmit = async () => {
        const currentData = editingStaff || newStaffData;

        if (!currentData.name || !currentData.email || !currentData.staffNumber || !currentData.jobRole || !currentData.gradeId || !currentData.teamId) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            if (editingStaff) {
                await updateStaff(editingStaff.id, currentData);
                toast.success("Staff member updated successfully!");
            } else {
                await addStaff(currentData);
                toast.success("Staff member added successfully!");
            }
            const freshStaffData = await getStaff();
            setStaff(freshStaffData);
            setAllStaff(freshStaffData);

            handleCloseDialog(); // Close dialog and redirect if needed

        } catch (error) {
            console.error("Failed to save staff:", error);
            toast.error(`Failed to save staff. ${error.message || ''}`);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff member?")) return;
        setLoading(true);
        try {
            await deleteStaff(id);
            const freshStaffData = await getStaff();
            setStaff(freshStaffData);
            setAllStaff(freshStaffData);
            toast.success("Staff member deleted successfully!");
        } catch (error) {
            console.error("Failed to delete staff:", error);
            toast.error("Failed to delete staff. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingStaff(null);
        setNewStaffData(initialNewStaffState);
        setIsDialogOpen(true);
    };

    const openEditDialog = (staffMemberToEdit) => {
        setEditingStaff(staffMemberToEdit);
        setIsDialogOpen(true);
    };

    if (loading && !isDialogOpen) {
        return <LoadingSpinner/>;
    }

    const currentFormData = editingStaff || newStaffData;

    return (
        <div className="space-y-4">
            {!staffMember && <Button onClick={openAddDialog}>Add New Staff</Button>}

            {staff.length === 0 && !loading && (
                <p className="text-muted-foreground">No staff members found. Add a new one!</p>
            )}

            {staff.length > 0 && !staffMember && (
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
                                    <Button variant="destructive" size="sm"
                                            onClick={() => handleDelete(s.id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
                        <DialogDescription>
                            Fill in the details below. Required fields are marked with an asterisk.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input id="name" placeholder="Full Name *" value={currentFormData.name}
                               onChange={handleInputChange} required/>
                        <Input id="email" type="email" placeholder="Email *" value={currentFormData.email}
                               onChange={handleInputChange} required/>
                        <Input id="staffNumber" placeholder="Staff Number *" value={currentFormData.staffNumber}
                               onChange={handleInputChange} required/>
                        <Input id="jobRole" placeholder="Job Role *" value={currentFormData.jobRole}
                               onChange={handleInputChange} required/>

                        <Select value={currentFormData.gradeId}
                                onValueChange={(value) => handleSelectChange("gradeId", value)} required>
                            <SelectTrigger><SelectValue placeholder="Select Grade *"/></SelectTrigger>
                            <SelectContent>
                                {grades.map((grade) => (
                                    <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>))}
                            </SelectContent>
                        </Select>

                        <Select value={currentFormData.teamId}
                                onValueChange={(value) => handleSelectChange("teamId", value)} required>
                            <SelectTrigger><SelectValue placeholder="Select Team *"/></SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={currentFormData.lineManagerId ?? NONE_VALUE}
                            onValueChange={(value) => handleSelectChange("lineManagerId", value === NONE_VALUE ? null : value)}
                        >
                            <SelectTrigger><SelectValue placeholder="Select Line Manager (Optional)"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE_VALUE}>None</SelectItem>
                                {allStaff
                                    .filter((s) => s.id !== (editingStaff?.id || null))
                                    .map((manager) => (
                                        <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}