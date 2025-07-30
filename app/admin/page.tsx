import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GradeManagement } from "@/components/admin/grade-management"
import { TeamManagement } from "@/components/admin/team-management"

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground mt-2">Manage organizational structure and settings</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grade Management</CardTitle>
            <CardDescription>Manage job grades within the organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <GradeManagement />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>Manage teams within the organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamManagement />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
