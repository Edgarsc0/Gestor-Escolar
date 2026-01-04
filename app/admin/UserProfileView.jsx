import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, BookOpen, Users, Calendar, GraduationCap, Phone, Mail, MapPin, Heart, ArrowLeft } from "lucide-react"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"
import { Button } from "@/components/ui/button"

export function UserProfileView({ userId, onBack }) {
    const [user, setUser] = useState(null)
    const [details, setDetails] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (userId) {
            fetchDetails()
        }
    }, [userId])

    const fetchDetails = async () => {
        setLoading(true)
        try {
            
            const userRes = await fetch(`/api/users/${userId}`)
            if (!userRes.ok) throw new Error("User not found")
            const userData = await userRes.json()
            setUser(userData)

            
            const promises = [fetch(`/api/personal_info/${userData.id}`).then(res => res.ok ? res.json() : null)]

            if (userData.role === 'student') {
                promises.push(fetch(`/api/grades/kardex/${userData.id}`).then(res => res.ok ? res.json() : []))
                promises.push(fetch(`/api/user_relationships/student/${userData.id}`).then(res => res.ok ? res.json() : []))
            } else if (userData.role === 'tutor') {
                promises.push(fetch(`/api/user_relationships/tutor/${userData.id}`).then(res => res.ok ? res.json() : []))
            } else if (userData.role === 'teacher') {
                promises.push(fetch(`/api/schedules/teacher/${userData.id}`).then(res => res.ok ? res.json() : []))
                promises.push(fetch(`/api/groups/teacher/${userData.id}`).then(res => res.ok ? res.json() : []))
            }

            const results = await Promise.all(promises)

            const data = {
                personalInfo: results[0] || {},
                extra: {}
            }

            if (userData.role === 'student') {
                data.extra.kardex = results[1]
                data.extra.tutors = results[2]
            } else if (userData.role === 'tutor') {
                data.extra.students = results[1]
            } else if (userData.role === 'teacher') {
                data.extra.schedule = results[1]
                data.extra.groups = results[2]
            }

            setDetails(data)
        } catch (error) {
            console.error("Error fetching user details:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingOverlay message="Cargando perfil..." />
    }

    if (!user || !details) {
        return (
            <div className="text-center py-10">
                <p>No se pudo cargar el perfil del usuario.</p>
                <Button onClick={onBack} variant="outline" className="mt-4">Volver</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button onClick={onBack} variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Perfil de {user.full_name}
                    </h1>
                    <p className="text-slate-500">
                        Información detallada del {user.role === 'student' ? 'Alumno' : user.role === 'teacher' ? 'Docente' : 'Tutor'}
                    </p>
                </div>
            </div>

            {/* Contenido del perfil (el mismo que estaba en el Dialog) */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium text-slate-700">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500"><Mail className="h-4 w-4" /> Email</div>
                        <p className="font-medium">{user.email || "No registrado"}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500"><Mail className="h-4 w-4" /> Email Personal</div>
                        <p className="font-medium">{details.personalInfo.personal_email || "No registrado"}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500"><Phone className="h-4 w-4" /> Teléfono</div>
                        <p className="font-medium">{details.personalInfo.cell_phone || "No registrado"}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500"><MapPin className="h-4 w-4" /> Dirección</div>
                        <p className="font-medium">
                            {[details.personalInfo.street_address, details.personalInfo.neighborhood, details.personalInfo.postal_code].filter(Boolean).join(", ") || "No registrada"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500"><Heart className="h-4 w-4" /> Datos Médicos</div>
                        <p className="font-medium">
                            Tipo: {details.personalInfo.blood_type || "?"} | Alergias: {details.personalInfo.allergies || "Ninguna"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /> Fecha Nacimiento</div>
                        <p className="font-medium">{user.birth_date ? new Date(user.birth_date).toLocaleDateString() : "No registrada"}</p>
                    </div>
                </CardContent>
            </Card>

            {user.role === 'student' && (
                <>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-slate-700 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Tutores Relacionados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {details.extra.tutors?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {details.extra.tutors.map(tutor => (
                                        <div key={tutor.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="font-semibold text-slate-900">{tutor.tutor_name}</p>
                                            <p className="text-xs text-slate-500">{tutor.relationship_type}</p>
                                            <p className="text-xs text-slate-500">{tutor.tutor_email}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Sin tutores asignados.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-slate-700 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" /> Historial Académico (Kardex)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {details.extra.kardex?.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ciclo</TableHead>
                                                <TableHead>Materia</TableHead>
                                                <TableHead className="text-right">Calificación</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {details.extra.kardex.map((k, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="text-xs">{k.school_cycle}</TableCell>
                                                    <TableCell className="text-sm font-medium">{k.subject_name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={k.final_grade >= 6 ? "default" : "destructive"}>
                                                            {k.final_grade ?? '-'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Sin historial académico registrado.</p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {user.role === 'tutor' && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-slate-700 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Alumnos Relacionados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {details.extra.students?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {details.extra.students.map(student => (
                                    <div key={student.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <p className="font-semibold text-slate-900">{student.student_name}</p>
                                        <p className="text-xs text-slate-500">{student.level_name} - {student.group_name}</p>
                                        <p className="text-xs text-slate-500">{student.student_email}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Sin alumnos asignados.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {user.role === 'teacher' && (
                <>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-slate-700 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Grupos Asignados (Titular)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {details.extra.groups?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {details.extra.groups.map(group => (
                                        <Badge key={group.id} variant="secondary" className="text-sm py-1 px-3">
                                            {group.name} ({group.level_name})
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No es titular de ningún grupo.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-slate-700 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Clases Asignadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {details.extra.schedule?.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Día</TableHead>
                                                <TableHead>Horario</TableHead>
                                                <TableHead>Materia</TableHead>
                                                <TableHead>Grupo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {details.extra.schedule.map((s, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="text-sm">{s.day_of_week}</TableCell>
                                                    <TableCell className="text-xs text-slate-500">{s.start_time.substring(0,5)} - {s.end_time.substring(0,5)}</TableCell>
                                                    <TableCell className="font-medium text-sm">{s.subject_name}</TableCell>
                                                    <TableCell className="text-sm">{s.group_name}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Sin clases asignadas en el horario.</p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
