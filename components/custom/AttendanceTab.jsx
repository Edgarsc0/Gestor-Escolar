"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, ShieldCheck, CalendarDays } from "lucide-react"

export default function AttendanceTab({ attendanceData, stats }) {
    const getStatusConfig = (status) => {
        switch(status) {
            case 'presente': return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Presente' };
            case 'falta': return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Falta' };
            case 'retardo': return { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, label: 'Retardo' };
            case 'justificado': return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ShieldCheck, label: 'Justificado' };
            default: return { color: 'bg-slate-100 text-slate-800', icon: CalendarDays, label: status };
        }
    }

    const filteredData = attendanceData.filter(r => ['presente', 'falta'].includes(r.status));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-blue-600">{stats.percentage != null ? `${stats.percentage}%` : "--"}</span>
                        <span className="text-sm text-slate-500 mt-1">Asistencia Global</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-green-600">{stats.present}</span>
                        <span className="text-sm text-slate-500 mt-1">Asistencias</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-red-600">{stats.absent}</span>
                        <span className="text-sm text-slate-500 mt-1">Faltas</span>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial Detallado</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Materia</TableHead>
                                <TableHead>Profesor</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((record) => {
                                const config = getStatusConfig(record.status);
                                const Icon = config.icon;
                                return (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {new Date(record.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell>{record.subject_name}</TableCell>
                                        <TableCell>{record.teacher_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${config.color} flex w-fit items-center gap-1`}>
                                                <Icon className="h-3 w-3" />
                                                {config.label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                        No hay registros de asistencia disponibles.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}