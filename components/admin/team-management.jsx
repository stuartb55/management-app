"use client";

import React, {useState} from "react";
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
import {addTeam, deleteTeam, updateTeam} from "@/lib/api-client";
import {toast} from "sonner";
import LoadingSpinner from "../loading-spinner";

export function TeamManagement({initialTeams}) {
    const [teams, setTeams] = useState(initialTeams);
    const [newTeamName, setNewTeamName] = useState("");
    const [editingTeam, setEditingTeam] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAddTeam = async () => {
        if (!newTeamName.trim()) {
            toast.error("Team name cannot be empty.");
            return;
        }
        setLoading(true);
        try {
            const addedTeam = await addTeam({name: newTeamName});
            setTeams((prev) => [...prev, addedTeam]);
            setNewTeamName("");
            setIsDialogOpen(false);
            toast.success("Team added successfully!");
        } catch (error) {
            console.error("Failed to add team:", error);
            toast.error("Failed to add team. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTeam = async () => {
        if (!editingTeam?.name.trim()) {
            toast.error("Team name cannot be empty.");
            return;
        }
        if (!editingTeam) return;

        setLoading(true);
        try {
            const updated = await updateTeam(editingTeam.id, {name: editingTeam.name});
            setTeams((prev) =>
                prev.map((team) => (team.id === updated.id ? updated : team)),
            );
            setEditingTeam(null);
            setIsDialogOpen(false);
            toast.success("Team updated successfully!");
        } catch (error) {
            console.error("Failed to update team:", error);
            toast.error("Failed to update team. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async (id) => {
        if (!window.confirm("Are you sure you want to delete this team?")) return;
        setLoading(true);
        try {
            await deleteTeam(id);
            setTeams((prev) => prev.filter((team) => team.id !== id));
            toast.success("Team deleted successfully!");
        } catch (error) {
            console.error("Failed to delete team:", error);
            toast.error("Failed to delete team. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingTeam(null);
        setNewTeamName("");
        setIsDialogOpen(true);
    };

    const openEditDialog = (team) => {
        setEditingTeam(team);
        setNewTeamName(team.name);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <Button onClick={openAddDialog}>Add New Team</Button>

            {loading && <LoadingSpinner/>}

            {!loading && teams.length === 0 && (
                <p className="text-muted-foreground">No teams found. Add a new one!</p>
            )}

            {!loading && teams.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Team Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow key={team.id}>
                                <TableCell>{team.name}</TableCell>
                                <TableCell className="space-x-2 text-right">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(team)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteTeam(team.id)}
                                    >
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
                        <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
                        <DialogDescription>
                            {editingTeam
                                ? "Make changes to the team here."
                                : "Add a new team to the system."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            id="teamName"
                            placeholder="Team Name"
                            value={editingTeam ? editingTeam.name : newTeamName}
                            onChange={(e) =>
                                editingTeam
                                    ? setEditingTeam({...editingTeam, name: e.target.value})
                                    : setNewTeamName(e.target.value)
                            }
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={editingTeam ? handleUpdateTeam : handleAddTeam}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : editingTeam ? "Save Changes" : "Add Team"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}