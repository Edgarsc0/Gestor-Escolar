import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function IncidentsTab({ incidents, onJustify }) {

    console.log(incidents)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Incidencias y Asistencia</CardTitle>
                <CardDescription>Registro de faltas y comportamiento</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 font-medium text-slate-700">Fecha</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-700">Tipo</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-700">Materia</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-700">Estatus</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.map((incident) => (
                                <tr key={incident.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 text-slate-700">{incident.date}</td>
                                    <td className="py-3 px-4">
                                        <Badge
                                            variant={incident.type === "Falta" ? "destructive" : "default"}
                                            className={incident.type === "Falta" ? "bg-rose-500 hover:bg-rose-600" : ""}
                                        >
                                            {incident.type}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-slate-700">{incident.subject}</td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={
                                                incident.status === "Pendiente"
                                                    ? "text-amber-600 font-medium"
                                                    : "text-emerald-600 font-medium"
                                            }
                                        >
                                            {incident.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {incident.status === "Pendiente" && (
                                            <Button
                                                size="sm"
                                                onClick={() => onJustify(incident)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Justificar
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
