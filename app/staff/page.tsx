import { StaffManagement } from "@/components/staff-management"

export default function StaffPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground mt-2">Manage your team members and their information</p>
      </div>
      <StaffManagement />
    </div>
  )
}
