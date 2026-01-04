import { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, AlertTriangle, Calendar, FileText } from "lucide-react"

export default function IncidentsTab({ incidents, onJustify, onAcknowledge }) {
    const [selectedIncident, setSelectedIncident] = useState(null)
    const { user } = useAuth()

    return (
        <>
            <div className="space-y-4">
                {incidents.length > 0 ? (
                    incidents.map((incident) => (
                        <Card 
                            key={incident.id} 
                            className="cursor-pointer transition-all hover:shadow-md hover:border-slate-300"
                            onClick={() => setSelectedIncident(incident)}
                        >
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                    incident.status === 'Pendiente' 
                                        ? (incident.type === 'Falta' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600')
                                        : 'bg-green-100 text-green-600'
                                }`}>
                                    {incident.status === 'Pendiente' ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={incident.type === "Falta" ? "destructive" : "default"}
                                                className={`font-bold ${incident.type === "Falta" ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"}`}
                                            >
                                                {incident.type}
                                            </Badge>
                                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {incident.date}
                                            </span>
                                        </div>
                                        <Badge 
                                            variant="outline"
                                            className={
                                                incident.status === "Pendiente"
                                                    ? "border-amber-300 text-amber-700 bg-amber-50"
                                                    : "border-green-300 text-green-700 bg-green-50"
                                            }
                                        >
                                            {incident.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 truncate">
                                        {incident.subject}
                                    </p>
                                </div>
                                {user?.role === 'tutor' && incident.status === "Pendiente" && (
                                    <div className="ml-4">
                                        {["Falta", "Retardo"].includes(incident.type) ? (
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onJustify(incident);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Justificar
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAcknowledge(incident);
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Enterado
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="border-dashed border-2">
                        <CardContent className="p-12 text-center text-slate-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <h3 className="font-medium text-lg">¡Todo en orden!</h3>
                            <p>No hay incidencias registradas para este alumno.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

        <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalle de Incidencia</DialogTitle>
                    <DialogDescription>
                        Información detallada del reporte.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Fecha</p>
                            <p className="text-slate-900">{selectedIncident?.date}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tipo</p>
                            <Badge
                                variant={selectedIncident?.type === "Falta" ? "destructive" : "default"}
                                className={selectedIncident?.type === "Falta" ? "bg-rose-500" : ""}
                            >
                                {selectedIncident?.type}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Estatus</p>
                            <p className={selectedIncident?.status === "Pendiente" ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
                                {selectedIncident?.status}
                            </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Descripción</p>
                        <div className="bg-slate-50 p-3 rounded-md text-slate-700 text-sm border border-slate-100 max-h-40 overflow-y-auto">
                            {selectedIncident?.subject || "Sin descripción"}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedIncident(null)}>Cerrar</Button>
                    {user?.role === 'tutor' && selectedIncident?.status === "Pendiente" && (
                        ["Falta", "Retardo"].includes(selectedIncident.type) ? (
                            <Button 
                                onClick={() => {
                                    onJustify(selectedIncident)
                                    setSelectedIncident(null)
                                }} 
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Justificar
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => {
                                    onAcknowledge(selectedIncident)
                                    setSelectedIncident(null)
                                }} 
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como enterado
                            </Button>
                        )
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}
