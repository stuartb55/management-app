"use client"

import {useState, useMemo} from "react"
import {Button} from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {Badge} from "@/components/ui/badge"
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {Search, User} from "lucide-react"
import {useRouter} from "next/navigation"
import type {Staff} from "@/lib/types"

interface StaffQuickSearchProps {
    staff: Staff[]
}

export function StaffQuickSearch({staff}: StaffQuickSearchProps) {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const router = useRouter()

    const filteredStaff = useMemo(() => {
        if (!searchValue) return staff.slice(0, 8) // Show first 8 when no search

        return staff.filter(member =>
            member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            member.email.toLowerCase().includes(searchValue.toLowerCase()) ||
            member.jobRole.toLowerCase().includes(searchValue.toLowerCase()) ||
            (member.teamName && member.teamName.toLowerCase().includes(searchValue.toLowerCase()))
        )
    }, [staff, searchValue])

    const handleSelectStaff = (staffId: string) => {
        setOpen(false)
        setSearchValue("")
        router.push(`/staff/${staffId}`)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-[300px]">
                    <Search className="mr-2 h-4 w-4"/>
                    <span className="text-muted-foreground">Search staff members...</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search by name, role, team..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandEmpty>
                        <div className="flex flex-col items-center justify-center py-6">
                            <User className="h-8 w-8 text-muted-foreground mb-2"/>
                            <p className="text-sm text-muted-foreground">No staff members found</p>
                        </div>
                    </CommandEmpty>
                    <CommandGroup heading="Staff Members" className="max-h-[300px] overflow-y-auto">
                        {filteredStaff.map((member) => (
                            <CommandItem
                                key={member.id}
                                value={`${member.name} ${member.email} ${member.jobRole} ${member.teamName || ''}`}
                                onSelect={() => handleSelectStaff(member.id)}
                                className="flex items-center gap-3 p-3 cursor-pointer"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-sm">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{member.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {member.jobRole} • {member.teamName || "No team"}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {member.email && (
                                        <Badge variant="outline" className="text-xs truncate max-w-[120px]">
                                            {member.email}
                                        </Badge>
                                    )}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    {staff.length > 8 && !searchValue && (
                        <div className="border-t p-2">
                            <Button
                                variant="ghost"
                                className="w-full text-sm"
                                onClick={() => {
                                    setOpen(false)
                                    router.push('/staff')
                                }}
                            >
                                View all {staff.length} staff members
                            </Button>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    )
}