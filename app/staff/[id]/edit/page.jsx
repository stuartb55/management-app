import {getStaff, getStaffById} from "@/lib/database"
import {StaffManagement} from "@/components/staff-management"
import {notFound} from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function EditStaffPage({params}) {
    const {id} = params

    const [staffMember, allStaff] = await Promise.all([
        getStaffById(id),
        getStaff(),
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
                        <BreadcrumbLink href={`/staff/${id}`}>
                            {staffMember.name}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Edit</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <StaffManagement staffMember={staffMember} allStaff={allStaff}/>
        </div>
    )
}