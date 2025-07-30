import { getNotes, getStaff } from "@/lib/database"
import { NotesManagement } from "@/components/notes-management"

export default async function NotesPage() {
  const [notes, staff] = await Promise.all([getNotes(), getStaff()])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notes Management</h1>
        <p className="text-muted-foreground mt-2">Document important information and updates</p>
      </div>
      <NotesManagement initialNotes={notes} staff={staff} />
    </div>
  )
}
