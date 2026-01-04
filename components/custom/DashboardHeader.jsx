"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown } from "lucide-react"

export default function DashboardHeader({ currentChild, childrenList, isLoading }) {
    const { user } = useAuth()
    const router = useRouter()

    const handleChildSwitch = (studentId) => {
        router.push(`/padre_tutor/${studentId}`)
    }

    return (
        <header className="bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src="/placeholder.svg?height=48&width=48" alt={currentChild?.student_name || "Alumno"} />
                            <AvatarFallback>{currentChild?.student_name?.substring(0, 2).toUpperCase() || "AL"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900">{currentChild?.student_name || "Cargando..."}</h1>
                            <p className="text-sm text-slate-600">
                                {currentChild?.group_name
                                    ? `${currentChild.level_name || ''} • ${currentChild.group_name}`
                                    : "Panel Estudiantil"}
                            </p>
                        </div>
                        {!isLoading && childrenList.length > 1 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="ml-4 bg-transparent">
                                        Cambiar Hijo
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {childrenList.map((child) => (
                                        <DropdownMenuItem key={child.student_id} onClick={() => handleChildSwitch(child.student_id)}>
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">{child.student_name}</span>
                                                {child.group_name && (
                                                    <span className="text-xs text-slate-500">
                                                        {child.level_name} • {child.group_name}
                                                    </span>
                                                )}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    <div className="flex items-center gap-3">

                        <Avatar className="h-9 w-9">
                            <AvatarFallback onClick={() => { router.push('/padre_tutor/info') }}>{user?.full_name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </header>
    )
}
