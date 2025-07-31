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
import {addGrade, deleteGrade, updateGrade} from "@/lib/api-client";
import {toast} from "sonner";
import LoadingSpinner from "../loading-spinner";

export function GradeManagement({initialGrades}) {
    const [grades, setGrades] = useState(initialGrades);
    const [newGradeName, setNewGradeName] = useState("");
    const [editingGrade, setEditingGrade] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAddGrade = async () => {
        if (!newGradeName.trim()) {
            toast.error("Grade name cannot be empty.");
            return;
        }
        setLoading(true);
        try {
            const addedGrade = await addGrade({name: newGradeName});
            setGrades((prev) => [...prev, addedGrade]);
            setNewGradeName("");
            setIsDialogOpen(false);
            toast.success("Grade added successfully!");
        } catch (error) {
            console.error("Failed to add grade:", error);
            toast.error("Failed to add grade. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGrade = async () => {
        if (!editingGrade?.name.trim()) {
            toast.error("Grade name cannot be empty.");
            return;
        }
        if (!editingGrade) return;

        setLoading(true);
        try {
            const updated = await updateGrade(editingGrade.id, {name: editingGrade.name});
            setGrades((prev) =>
                prev.map((grade) => (grade.id === updated.id ? updated : grade)),
            );
            setEditingGrade(null);
            setIsDialogOpen(false);
            toast.success("Grade updated successfully!");
        } catch (error) {
            console.error("Failed to update grade:", error);
            toast.error("Failed to update grade. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGrade = async (id) => {
        if (!window.confirm("Are you sure you want to delete this grade?")) return;
        setLoading(true);
        try {
            await deleteGrade(id);
            setGrades((prev) => prev.filter((grade) => grade.id !== id));
            toast.success("Grade deleted successfully!");
        } catch (error) {
            console.error("Failed to delete grade:", error);
            toast.error("Failed to delete grade. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const openAddDialog = () => {
        setEditingGrade(null);
        setNewGradeName("");
        setIsDialogOpen(true);
    };

    const openEditDialog = (grade) => {
        setEditingGrade(grade);
        setNewGradeName(grade.name);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <Button onClick={openAddDialog}>Add New Grade</Button>

            {loading && <LoadingSpinner/>}

            {!loading && grades.length === 0 && (
                <p className="text-muted-foreground">No grades found. Add a new one!</p>
            )}

            {!loading && grades.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Grade Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades.map((grade) => (
                            <TableRow key={grade.id}>
                                <TableCell>{grade.name}</TableCell>
                                <TableCell className="space-x-2 text-right">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(grade)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteGrade(grade.id)}
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
                        <DialogTitle>{editingGrade ? "Edit Grade" : "Add New Grade"}</DialogTitle>
                        <DialogDescription>
                            {editingGrade
                                ? "Make changes to the grade here."
                                : "Add a new grade to the system."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            id="gradeName"
                            placeholder="Grade Name"
                            value={editingGrade ? editingGrade.name : newGradeName}
                            onChange={(e) =>
                                editingGrade
                                    ? setEditingGrade({...editingGrade, name: e.target.value})
                                    : setNewGradeName(e.target.value)
                            }
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={editingGrade ? handleUpdateGrade : handleAddGrade}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : editingGrade ? "Save Changes" : "Add Grade"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}