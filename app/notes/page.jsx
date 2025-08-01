import {getNotes, getStaff} from "@/lib/database";
import {NotesManagement} from "@/components/notes-management";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function NotesPage() {
    const [notes, staff] = await Promise.all([
        getNotes(),
        getStaff()
    ]);

    return (
        <div className="container mx-auto p-6">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Notes</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {/* Pass the correct props */}
            <NotesManagement notes={notes} allStaff={staff}/>
        </div>
    );
}