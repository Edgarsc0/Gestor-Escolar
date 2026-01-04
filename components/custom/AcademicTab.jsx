import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, BookOpen } from "lucide-react"

export default function AcademicTab({ subjects, period }) {
    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-100">
                <CardContent className="flex items-center gap-4 p-6">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Periodo Escolar Actual</p>
                        <h2 className="text-2xl font-bold text-slate-900">{period || "Ciclo Escolar 2024 - 2025"}</h2>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                            <CardTitle>Calificaciones por Materia</CardTitle>
                            <CardDescription>Desempeño académico del ciclo actual</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {subjects.map((subject, index) => {
                            const hasGrades = subject.p1 != null || subject.p2 != null || subject.p3 != null || subject.final != null;
                            return (
                                <div key={index} className="bg-slate-50 rounded-lg border border-slate-100 p-4 transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900">{subject.name}</h3>
                                            <p className="text-xs text-slate-500 mb-1">{subject.group}</p>
                                            {hasGrades && subject.final != null && (
                                                <div className="flex items-center gap-3 mt-1 w-full md:w-64">
                                                    <Progress value={(subject.final || 0) * 10} className="h-2 [&>div]:bg-emerald-500" />
                                                    <span className="text-xs font-medium text-slate-600">{(subject.final || 0) * 10}%</span>
                                                </div>
                                            )}
                                        </div>
                                        {hasGrades && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-500">Promedio Final:</span>
                                                <Badge className={`${subject.final == null ? 'bg-slate-500 hover:bg-slate-600' : (subject.final >= 6 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700')} text-lg px-3`}>
                                                    {subject.final ?? "-"}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {hasGrades ? (
                                        <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Parcial 1</p>
                                                <p className={`text-lg font-bold ${(subject.p1 || 0) >= 6 ? 'text-slate-700' : 'text-red-600'}`}>{subject.p1 ?? "-"}</p>
                                            </div>
                                            <div className="text-center border-l border-slate-200">
                                                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Parcial 2</p>
                                                <p className={`text-lg font-bold ${(subject.p2 || 0) >= 6 ? 'text-slate-700' : 'text-red-600'}`}>{subject.p2 ?? "-"}</p>
                                            </div>
                                            <div className="text-center border-l border-slate-200">
                                                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Parcial 3</p>
                                                <p className={`text-lg font-bold ${(subject.p3 || 0) >= 6 ? 'text-slate-700' : 'text-red-600'}`}>{subject.p3 ?? "-"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-t border-slate-200 pt-4 text-center">
                                            <p className="text-sm text-slate-500 italic">No hay calificación capturada</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {subjects.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                No se encontraron materias inscritas.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
