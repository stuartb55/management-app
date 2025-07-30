"use client";

import React, {useState, useEffect} from "react";
import {Staff, Grade, Team} from "@/lib/types";
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
import {toast} from "sonner"; // Using sonner for toasts
import LoadingSpinner from "./loading-spinner";
import Link from "next/link";
import {getStaffName} from "@/lib/utils";

export function StaffManagement() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [allStaff, setAllStaff] = useState<Staff[]>([]); // For line manager dropdown

    const [newStaffData, setNewStaffData] = useState<
        Omit<Staff, "id" | "createdAt" | "updatedAt" | "gradeName" | "teamName">
    >({
        firstName: "",
        lastName: "",
        email: "",
        gradeId: "",
        teamId: "",
        lineManagerId: null,
    });
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [staffData, gradesData, teamsData, allStaffData] = await Promise.all([
                    getStaff(),
                    getGrades(),
                    getTeams(),
                    getStaff(), // Fetch all staff for line manager selection
                ]);
                setStaff(staffData);
                setGrades(gradesData);
                setTeams(teamsData);
                setAllStaff(allStaffData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load staff data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        if (editingStaff) {
            setEditingStaff((prev) => ({...prev!, [id]: value}));
        } else {
            setNewStaffData((prev) => ({...prev, [id]: value}));
        }
    };

    const handleSelectChange = (id: string, value: string) => {
        if (editingStaff) {
            setEditingStaff((prev) => ({...prev!, [id]: value}));
        } else {
            setNewStaffData((prev) => ({...prev, [id]: value}));
        }
    };

    const handleAddStaff = async () => {
        if (
            !newStaffData.firstName ||
            !newStaffData.lastName ||
            !newStaffData.email ||
            !newStaffData.gradeId ||
            !newStaffData.teamId
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setLoading(true);
        try {
            const addedStaff = await addStaff(newStaffData);
            setStaff((prev) => [...prev, addedStaff]);
            setNewStaffData({
                firstName: "",
                lastName: "",
                email: "",
                gradeId: "",
                teamId: "",
                lineManagerId: null,
            });
            setIsDialogOpen(false);
            toast.success("Staff member added successfully!");
        } catch (error) {
            console.error("Failed to add staff:", error);
            toast.error("Failed to add staff. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStaff = async () => {
        if (
            !editingStaff?.firstName ||
            !editingStaff?.lastName ||
            !editingStaff?.email ||
            !editingStaff?.gradeId ||
            !editingStaff?.teamId
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }
        if (!editingStaff) return;

        setLoading(true);
        try {
            // Omit gradeName and teamName as they are derived from gradeId and teamId
            const {gradeName, teamName, ...dataToUpdate} = editingStaff;
            const updated = await updateStaff(editingStaff.id, dataToUpdate);
            setStaff((prev) =>
                prev.map((s) => (s.id === updated.id ? {...s, ...updated} : s)),
            ); // Update with new derived properties
            setEditingStaff(null);
            setIsDialogOpen(false);
            toast.success("Staff member updated successfully!");
        } catch (error) {
            console.error("Failed to update staff:", error);
            toast.error("Failed to update staff. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStaff = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this staff member?")) return;
        setLoading(true);
        try {
            await deleteStaff(id);
            setStaff((prev) => prev.filter((s) => s.id !== id));
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
        setNewStaffData({
            firstName: "",
            lastName: "",
            email: "",
            gradeId: "",
            teamId: "",
            lineManagerId: null,
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        setIsDialogOpen(true);
    };

    if (loading) {
        return <LoadingSpinner/>;
    }

    return (
        <div className="space-y-4">
            <Button onClick={openAddDialog}>Add New Staff</Button>

            {staff.length === 0 && (
                <p className="text-muted-foreground">No staff members found. Add a new one!</p>
            )}

            {staff.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Line Manager</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    <Link href={`/staff/${s.id}`} className="hover:underline">
                                        {getStaffName(s)}
                                    </Link>
                                </TableCell>
                                <TableCell>{s.email}</TableCell>
                                <TableCell>{s.gradeName}</TableCell>
                                <TableCell>{s.teamName}</TableCell>
                                <TableCell>
                                    {s.lineManagerId
                                        ? getStaffName(
                                            allStaff.find((manager) => manager.id === s.lineManagerId),
                                        )
                                        : "N/A"}
                                </TableCell>
                                <TableCell className="space-x-2 text-right">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(s)}>
                                        Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteStaff(s.id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingStaff
                                ? "Make changes to the staff member here."
                                : "Add a new staff member to the system."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="form-grid py-4">
                        <Input
                            id="firstName"
                            placeholder="First Name"
                            value={editingStaff ? editingStaff.firstName : newStaffData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                        <Input
                            id="lastName"
                            placeholder="Last Name"
                            value={editingStaff ? editingStaff.lastName : newStaffData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={editingStaff ? editingStaff.email : newStaffData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <Select
                            value={editingStaff ? editingStaff.gradeId : newStaffData.gradeId}
                            onValueChange={(value) => handleSelectChange("gradeId", value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Grade"/>
                            </SelectTrigger>
                            <SelectContent>
                                {grades.map((grade) => (
                                    <SelectItem key={grade.id} value={grade.id}>
                                        {grade.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={editingStaff ? editingStaff.teamId : newStaffData.teamId}
                            onValueChange={(value) => handleSelectChange("teamId", value)}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Team"/>
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team.id} value={team.id}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={
                                editingStaff?.lineManagerId ||
                                newStaffData.lineManagerId ||
                                ""
                            }
                            onValueChange={(value) =>
                                handleSelectChange("lineManagerId", value === "" ? null : value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Line Manager (Optional)"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {allStaff
                                    .filter((s) => s.id !== (editingStaff?.id || "temp")) // Cannot be their own manager
                                    .map((manager) => (
                                        <SelectItem key={manager.id} value={manager.id}>
                                            {getStaffName(manager)}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={editingStaff ? handleUpdateStaff : handleAddStaff}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : editingStaff ? "Save Changes" : "Add Staff"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}