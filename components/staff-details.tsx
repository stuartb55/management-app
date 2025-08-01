import type {Staff} from "@/lib/types"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Pencil} from "lucide-react"

interface StaffDetailsProps {
    staffMember: Staff
    onEditClick: () => void; // Add onEditClick to the props interface
}

export function StaffDetails({staffMember, onEditClick}: StaffDetailsProps) {
    const details = [
        {label: "Email", value: staffMember.email},
        {label: "Job Role", value: staffMember.jobRole},
        {label: "Team", value: staffMember.teamName || "N/A"},
        {label: "Line Manager", value: staffMember.lineManagerName || "N/A"},
    ]

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">{staffMember.name}</CardTitle>
                    <CardDescription>
                        Staff ID: {staffMember.staffNumber}
                    </CardDescription>
                </div>
                {/* Change the button to use the onClick handler */}
                <Button onClick={onEditClick}>
                    <Pencil className="mr-2 h-4 w-4"/>
                    Edit Details
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.map(detail => (
                        <div key={detail.label} className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                {detail.label}
              </span>
                            <span className="text-base">{detail.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}