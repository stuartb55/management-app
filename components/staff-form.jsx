"use client";

import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {addStaff, updateStaff} from "@/lib/api-client";
import {toast} from "sonner";

const NONE_VALUE = "none";

export function StaffForm({staffToEdit, allStaff, grades, teams, onSave, onCancel}) {
    const router = useRouter();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const isEditing = !!staffToEdit;

    useEffect(() => {
        const initialFormData = {
            name: "",
            email: "",
            staffNumber: "",
            jobRole: "",
            gradeId: "",
            teamId: "",
            lineManagerId: null,
        };

        if (staffToEdit) {
            // When editing, properly handle the lineManagerId
            setFormData({
                ...staffToEdit,
                // Ensure lineManagerId is properly set, even if it's null
                lineManagerId: staffToEdit.lineManagerId || null
            });
        } else {
            setFormData(initialFormData);
        }
    }, [staffToEdit]);

    const handleInputChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.value});
    };

    const handleSelectChange = (id, value) => {
        // Special handling for lineManagerId
        if (id === 'lineManagerId') {
            setFormData({
                ...formData,
                [id]: value === NONE_VALUE ? null : value
            });
        } else {
            setFormData({...formData, [id]: value});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.staffNumber || !formData.jobRole || !formData.gradeId || !formData.teamId) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            // Prepare the data for submission - only include updatable fields
            const submitData = {
                name: formData.name,
                email: formData.email,
                staffNumber: formData.staffNumber,
                jobRole: formData.jobRole,
                gradeId: formData.gradeId,
                teamId: formData.teamId,
                lineManagerId: formData.lineManagerId === NONE_VALUE ? null : formData.lineManagerId
            };

            // Only include jobId if it exists
            if (formData.jobId !== undefined && formData.jobId !== null) {
                submitData.jobId = formData.jobId;
            }

            console.log('Submitting staff data:', submitData); // Debug log

            if (isEditing) {
                await updateStaff(formData.id, submitData);
                toast.success("Staff member updated successfully!");
                if (onSave) onSave();
            } else {
                const newStaff = await addStaff(submitData);
                toast.success("Staff member added successfully!");
                router.push(`/staff/${newStaff.id}`);
            }
            router.refresh();
        } catch (error) {
            console.error('Error submitting staff data:', error); // Debug log
            toast.error(`Failed to save staff. ${error.message || ''}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    // Get the current line manager value for the select
    const getLineManagerSelectValue = () => {
        if (formData.lineManagerId === null || formData.lineManagerId === undefined) {
            return NONE_VALUE;
        }
        return formData.lineManagerId;
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <Input
                    id="name"
                    placeholder="Full Name *"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                />

                <Input
                    id="email"
                    type="email"
                    placeholder="Email *"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    required
                />

                <Input
                    id="staffNumber"
                    placeholder="Staff Number *"
                    value={formData.staffNumber || ''}
                    onChange={handleInputChange}
                    required
                />

                <Input
                    id="jobRole"
                    placeholder="Job Role *"
                    value={formData.jobRole || ''}
                    onChange={handleInputChange}
                    required
                />

                <Select
                    value={formData.gradeId || ''}
                    onValueChange={(value) => handleSelectChange("gradeId", value)}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Grade *"/>
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
                    value={formData.teamId || ''}
                    onValueChange={(value) => handleSelectChange("teamId", value)}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Team *"/>
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
                    value={getLineManagerSelectValue()}
                    onValueChange={(value) => handleSelectChange("lineManagerId", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Line Manager (Optional)"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={NONE_VALUE}>None</SelectItem>
                        {allStaff
                            .filter((s) => s.id !== (staffToEdit?.id || null))
                            .map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                    {manager.name}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Staff Member"}
                </Button>
            </div>
        </form>
    );
}