import {getTasks, getStaff} from "@/lib/database";
import {TaskManagement} from "@/components/task-management";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


export default async function TasksPage() {
    const [tasks, staff] = await Promise.all([
        getTasks(),
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
                        <BreadcrumbPage>Tasks</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <TaskManagement tasks={tasks} allStaff={staff}/>
        </div>
    );
}