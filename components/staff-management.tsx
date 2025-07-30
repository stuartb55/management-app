"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { getStaff, addStaff, updateStaff, deleteStaff, getGrades, getTeams } from "@/lib/api-client"
import type { Staff, Grade, Team } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { PlusCircle, Edit, Trash2, User, Mail, Phone, Briefcase, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

export function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<Partial<Staff> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    const [staffData, gradesData, teamsData] = await Promise.all([getStaff(), getGrades(), getTeams()])
    setStaff(staffData)
    setGrades(gradesData)
    setTeams(teamsData)
    setIsLoading(false)
  }

  const handleAddStaff = () => {
    setCurrentStaff({
      name: "",
      email: "",
      staffNumber: "",
      jobRole: "",
      jobId: "",
      gradeId: "",
      teamId: "",
      lineManagerId: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditStaff = (staffMember: Staff) => {
    setCurrentStaff({ ...staffMember })
    setIsDialogOpen(true)
  }

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      const success = await deleteStaff(id)
      if (success) {
        toast.success("Staff member deleted successfully!")
        fetchData()
      } else {
        toast.error("Failed to delete staff member.")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStaff) return

    let result: Staff | null
    if (currentStaff.id) {
      // Update existing staff
      result = await updateStaff(currentStaff.id, currentStaff)
      if (result) {
        toast.success("Staff member updated successfully!")
      } else {
        toast.error("Failed to update staff member.")
      }
    } else {
      // Add new staff
      result = await addStaff(
        currentStaff as Omit<Staff, "id" | "createdAt" | "updatedAt" | "gradeName" | "teamName" | "lineManagerName">,
      )
      if (result) {
        toast.success("Staff member added successfully!")
      } else {
        toast.error("Failed to add staff member.")
      }
    }

    if (result) {
      setIsDialogOpen(false)
      fetchData()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading staff data...</p>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Staff Directory</CardTitle>
        <Button onClick={handleAddStaff} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((staffMember) => (
            <Card key={staffMember.id} className="relative group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{staffMember.name}</CardTitle>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEditStaff(staffMember)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(staffMember.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {staffMember.email}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  Staff #: {staffMember.staffNumber}
                </p>
                {staffMember.jobRole && (
                  <p className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4" />
                    {staffMember.jobRole}
                  </p>
                )}
                {staffMember.teamName && (
                  <p className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4" />
                    Team: {staffMember.teamName}
                  </p>
                )}
                {staffMember.gradeName && (
                  <p className="flex items-center gap-2 mt-1">Grade: {staffMember.gradeName}</p>
                )}
                {staffMember.lineManagerName && (
                  <p className="flex items-center gap-2 mt-1">Manager: {staffMember.lineManagerName}</p>
                )}
                <Link
                  href={`/staff/${staffMember.id}`}
                  className="absolute bottom-3 right-3 text-primary hover:underline flex items-center"
                >
                  View Profile <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentStaff?.id ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
            <CardDescription>
              {currentStaff?.id
                ? "Make changes to staff member details here."
                : "Add a new staff member to your directory."}
            </CardDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentStaff?.name || ""}
                onChange={(e) => setCurrentStaff((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={currentStaff?.email || ""}
                onChange={(e) => setCurrentStaff((prev) => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="staffNumber" className="text-right">
                Staff #
              </Label>
              <Input
                id="staffNumber"
                value={currentStaff?.staffNumber || ""}
                onChange={(e) => setCurrentStaff((prev) => ({ ...prev, staffNumber: e.target.value }))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jobRole" className="text-right">
                Job Role
              </Label>
              <Input
                id="jobRole"
                value={currentStaff?.jobRole || ""}
                onChange={(e) => setCurrentStaff((prev) => ({ ...prev, jobRole: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jobId" className="text-right">
                Job ID
              </Label>
              <Input
                id="jobId"
                value={currentStaff?.jobId || ""}
                onChange={(e) => setCurrentStaff((prev) => ({ ...prev, jobId: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Grade
              </Label>
              <Select
                value={currentStaff?.gradeId || ""}
                onValueChange={(value) =>
                  setCurrentStaff((prev) => ({ ...prev, gradeId: value === "none" ? null : value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team" className="text-right">
                Team
              </Label>
              <Select
                value={currentStaff?.teamId || ""}
                onValueChange={(value) =>
                  setCurrentStaff((prev) => ({ ...prev, teamId: value === "none" ? null : value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lineManager" className="text-right">
                Line Manager
              </Label>
              <Select
                value={currentStaff?.lineManagerId || ""}
                onValueChange={(value) =>
                  setCurrentStaff((prev) => ({ ...prev, lineManagerId: value === "none" ? null : value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a line manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem> {/* Option for no line manager */}
                  {staff.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{currentStaff?.id ? "Save changes" : "Add Staff"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
