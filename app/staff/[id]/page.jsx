import {getStaffById, getStaff, getTasks, getNotes} from "@/lib/database"
import {StaffDetails} from "@/components/staff-details" // Corrected import
import {TaskManagement} from "@/components/task-management"
import {NotesManagement} from "@/components/notes-management"
import {notFound} from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function StaffProfilePage({params}) {
    const {id} = params

    // We still need allStaff to pass down to the task and note management components
    const [staffMember, allStaff, tasks, notes] = await Promise.all([
        getStaffById(id),
        getStaff(),
        getTasks(id),
        getNotes(id),
    ])

    if (!staffMember) {
        notFound()
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/staff">Staff</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{staffMember.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* This now correctly shows details, not a form */}
            <StaffDetails staffMember={staffMember}/>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TaskManagement
                    tasks={tasks}
                    staffId={id}
                    allStaff={allStaff} // allStaff is still needed here for the "Add Task" form
                />
                <NotesManagement
                    notes={notes}
                    staffId={id}
                    allStaff={allStaff} // allStaff is still needed here for the "Add Note" form
                />
            </div>
        </div>
    )
}