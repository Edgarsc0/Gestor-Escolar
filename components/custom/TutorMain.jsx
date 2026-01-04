"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Users, GraduationCap, ChevronRight, BookOpen, Award, TrendingUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingOverlay } from "./LoadingOverlay"

export default function TutorMain() {
    const { user } = useAuth()
    const [children, setChildren] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchChildren = async () => {
            if (!user?.id) return

            try {
                const res = await fetch(`/api/user_relationships/tutor/${user.id}`)
                if (res.ok) {
                    const data = await res.json()
                    
                    const colors = [
                        "from-blue-500 to-cyan-500",
                        "from-purple-500 to-pink-500",
                        "from-orange-500 to-red-500",
                        "from-emerald-500 to-teal-500"
                    ]

                    const mappedChildren = data.map((rel, index) => ({
                        id: rel.student_id,
                        name: rel.student_name,
                        grade: "Nivel General", 
                        avatar: "/placeholder.svg",
                        initials: rel.student_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                        attendance: "100%", 
                        avgGrade: "10.0",   
                        subjects: 5,        
                        color: colors[index % colors.length],
                    }))
                    setChildren(mappedChildren)
                }
            } catch (error) {
                console.error("Error fetching children:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchChildren()
    }, [user])

    const handleChildSelect = (child) => {
        window.location.href = `/padre_tutor/${child.id}`;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background mt-10">
            {isLoading && <LoadingOverlay message="Cargando alumnos..." />}
            
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/70">
                                <Users className="size-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-foreground">Tutor</h1>
                                <p className="text-sm text-muted-foreground">Sistema de gestión escolar</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer hover:scale-120 transition-all duration-200" onClick={() => window.location.href = "/padre_tutor/info"}>
                            <Avatar className="size-9 border-2 border-primary/20">
                                <AvatarImage src="/loving-parent.png" />
                                <AvatarFallback>{user?.full_name?.substring(0, 2).toUpperCase() || "TU"}</AvatarFallback>
                            </Avatar>
                            <h1 className="text-lg font-semibold text-foreground hidden sm:block">{user?.full_name || "Tutor"}</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-foreground text-balance">
                            Selecciona un hijo para ver su dashboard
                        </h2>
                        <p className="text-muted-foreground text-lg">Accede al progreso académico y detalles escolares</p>
                    </div>

                    {children.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {children.map((child) => (
                                <Card
                                    key={child.id}
                                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] border-2 hover:border-primary/50"
                                    onClick={() => handleChildSelect(child)}
                                >
                                    <CardHeader className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-1 rounded-full bg-gradient-to-br ${child.color}`}>
                                                <Avatar className="size-16 border-4 border-background">
                                                    <AvatarImage src={child.avatar || "/placeholder.svg"} />
                                                    <AvatarFallback className="text-xl font-bold">{child.initials}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <ChevronRight className="size-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{child.name}</CardTitle>
                                            <CardDescription className="flex flex-col gap-1 mt-1">
                                                <span className="flex items-center gap-1.5">
                                                    <GraduationCap className="size-4" />
                                                    {child.grade}
                                                </span>
                                                <span className="text-xs font-medium">Boleta: {child.id}</span>
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-center">
                                                    <TrendingUp className="size-4 text-green-500" />
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{child.avgGrade}</p>
                                                <p className="text-xs text-muted-foreground">Promedio</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-center">
                                                    <Award className="size-4 text-blue-500" />
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{child.attendance}</p>
                                                <p className="text-xs text-muted-foreground">Asistencia</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-center">
                                                    <BookOpen className="size-4 text-orange-500" />
                                                </div>
                                                <p className="text-2xl font-bold text-foreground">{child.subjects}</p>
                                                <p className="text-xs text-muted-foreground">Materias</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleChildSelect(child)}
                                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all bg-transparent"
                                            variant="outline"
                                        >
                                            Ver Dashboard
                                            <ChevronRight className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No se encontraron alumnos asociados a tu cuenta.
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
