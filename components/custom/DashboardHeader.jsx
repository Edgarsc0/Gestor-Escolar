import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown } from "lucide-react"

export default function DashboardHeader() {
    return (
        <header className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Juan Pérez" />
                            <AvatarFallback>JP</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">Juan Pérez</h1>
                            <p className="text-sm text-slate-600">3° Primaria - Group B</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-4 bg-transparent">
                                    Cambiar Hijo
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => window.location.href = "/padre_tutor/1"}>Juan Pérez - 3° Primaria</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.location.href = "/padre_tutor/2"}>María Pérez - 5° Primaria</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full"></span>
                        </Button>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    )
}
