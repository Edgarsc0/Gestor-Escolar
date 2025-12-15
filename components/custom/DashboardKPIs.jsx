import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, AlertTriangle, Clock, FileCheck } from "lucide-react"

export default function DashboardKPIs() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Card 1: Academic */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio Actual</CardTitle>
                    <GraduationCap className="h-5 w-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900">9.2</div>
                    <Progress value={92} className="mt-3 [&>div]:bg-emerald-500" />
                    <p className="text-xs text-slate-600 mt-2">92% de rendimiento</p>
                </CardContent>
            </Card>

            {/* Card 2: Behavior */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Incidencias Activas</CardTitle>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-amber-500">1</div>
                    <p className="text-xs text-slate-600 mt-3">Requiere atención</p>
                </CardContent>
            </Card>

            {/* Card 3: Schedule */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Próxima Clase</CardTitle>
                    <Clock className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-semibold text-slate-900">Matemáticas</div>
                    <p className="text-sm text-slate-600 mt-1">10:00 AM</p>
                </CardContent>
            </Card>

        </div>
    )
}
