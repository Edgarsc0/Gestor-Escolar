import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function AcademicTab({ subjects }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Calificaciones por Materia</CardTitle>
                <CardDescription>Desempeño académico del ciclo actual</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                                <h3 className="font-medium text-slate-900">{subject.name}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <Progress value={subject.grade * 10} className="flex-1 [&>div]:bg-emerald-500" />
                                    <span className="text-sm text-slate-600 w-12">{subject.grade * 10}%</span>
                                </div>
                            </div>
                            <Badge className="ml-4 bg-emerald-500 hover:bg-emerald-600 text-white">{subject.grade}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
