import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, XCircle, CheckCircle2, FileText, Inbox, Clock, ChevronRight, Image as ImageIcon, AlertCircle } from "lucide-react"
import { SuccessModal } from "@/components/custom/SuccessDialog"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function JustificationsView() {
    const { user } = useAuth()
    const [selectedJustification, setSelectedJustification] = useState(null)
    const [adminComment, setAdminComment] = useState("")
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [justifications, setJustifications] = useState([])

    useEffect(() => {
        fetchJustifications()
    }, [])

    useEffect(() => {
        setAdminComment("")
    }, [selectedJustification])

    const fetchJustifications = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/justifications')
            if (res.ok) {
                const data = await res.json()
                const formatted = data.map(j => ({
                    id: j.id,
                    studentName: j.student_name,
                    group: j.group_name || "Sin grupo",
                    date: new Date(j.incident_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
                    type: j.incident_type,
                    status: "pending",
                    attendanceRate: j.attendance_rate,
                    reason: j.reason,
                    evidence: j.evidence_urls || []
                }))
                setJustifications(formatted)
            }
        } catch (error) {
            console.error("Error fetching justifications:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (justification) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/justifications/${justification.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin_comment: adminComment || "Aprobada",
                    reviewed_by: user.id,
                    approved: true
                })
            })
            if (res.ok) {
                setJustifications(prev => prev.filter(j => j.id !== justification.id))
                setSelectedJustification(null)
                setSuccessMessage("La justificación ha sido aprobada.")
                setShowSuccessModal(true)
            }
        } catch (error) {
            console.error("Error approving:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/justifications/${selectedJustification.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin_comment: adminComment,
                    reviewed_by: user.id,
                    approved: false
                })
            })
            if (res.ok) {
                setJustifications(prev => prev.filter(j => j.id !== selectedJustification.id))
                setSelectedJustification(null)
                setSuccessMessage("La justificación ha sido rechazada.")
                setShowSuccessModal(true)
            }
        } catch (error) {
            console.error("Error rejecting:", error)
            setErrorDialog({ isOpen: true, title: "Error al rechazar", description: "No se pudo completar la acción. Intente nuevamente." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {isLoading && <LoadingOverlay message="Procesando solicitud..." />}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Left Panel - List */}
                <Card className="lg:col-span-4 border-slate-200 flex flex-col h-full overflow-hidden shadow-sm">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Inbox className="h-5 w-5 text-blue-600" />
                            Solicitudes Pendientes
                        </CardTitle>
                        <CardDescription>
                            {justifications.length} justificaciones por revisar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        <div className="divide-y divide-slate-200">
                            {justifications.map((justification) => (
                                <button
                                    key={justification.id}
                                    onClick={() => setSelectedJustification(justification)}
                                    className={`w-full p-4 text-left transition-all hover:bg-slate-50 group ${selectedJustification?.id === justification.id ? "bg-blue-50/60 border-l-4 border-blue-600" : "border-l-4 border-transparent"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                <AvatarFallback className="bg-white text-slate-600 font-medium">
                                                    {justification.studentName.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-slate-900 text-sm">{justification.studentName}</div>
                                                <div className="text-xs text-slate-500">{justification.group}</div>
                                            </div>
                                        </div>
                                        {selectedJustification?.id === justification.id && (
                                            <ChevronRight className="h-4 w-4 text-blue-600" />
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-3 pl-14">
                                        <Badge
                                            variant="outline"
                                            className={
                                                justification.type === "Falta"
                                                    ? "bg-red-50 text-red-700 border-red-200"
                                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                            }
                                        >
                                            {justification.type}
                                        </Badge>
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {justification.date}
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {justifications.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                    <p>No hay solicitudes pendientes</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Panel - Detail */}
                <Card className="lg:col-span-8 border-slate-200 h-full flex flex-col shadow-sm overflow-hidden">
                    {selectedJustification ? (
                        <>
                            <CardHeader className="border-b border-slate-100 bg-white pb-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                                className={
                                                    selectedJustification.type === "Falta"
                                                        ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                                                        : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
                                                }
                                            >
                                                {selectedJustification.type}
                                            </Badge>
                                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Pendiente de revisión
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl font-bold text-slate-900">
                                            {selectedJustification.studentName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <span>Grupo {selectedJustification.group}</span>
                                            <span>•</span>
                                            <span>Fecha de incidencia: {selectedJustification.date}</span>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                                <div className="space-y-6">
                                    {/* Reason */}
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            Motivo de la Justificación
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {selectedJustification.reason}
                                        </p>
                                    </div>

                                    {/* Evidence */}
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-blue-600" />
                                            Evidencia Adjunta
                                        </h3>
                                        {selectedJustification.evidence && selectedJustification.evidence.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {selectedJustification.evidence.map((url, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="relative group rounded-lg overflow-hidden bg-slate-100 aspect-square border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                                        onClick={() => window.open(url, '_blank')}
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Evidencia ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 bg-black/50 px-2 py-1 rounded">Ver</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-32 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                                <span className="text-sm">Sin evidencia adjunta</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Comment Section */}
                                    <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mt-4">
                                        <Label htmlFor="admin-comment" className="text-sm font-semibold text-blue-900 mb-2 block">
                                            Agregar comentarios de administrador
                                        </Label>
                                        <Textarea
                                            id="admin-comment"
                                            placeholder="Escribe un comentario, observación o motivo de rechazo..."
                                            value={adminComment}
                                            onChange={(e) => setAdminComment(e.target.value)}
                                            className="min-h-[100px] bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                        />
                                    </div>
                                </div>
                            </CardContent>

                            {/* Action Bar */}
                            <div className="border-t border-slate-200 p-4 bg-white flex items-center justify-between">
                                <span className="text-xs text-slate-500 hidden sm:inline-block">
                                    Acciones para solicitud #{selectedJustification.id}
                                </span>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={handleReject}
                                        className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rechazar
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(selectedJustification)}
                                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Aprobar
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <Inbox className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-600">Ninguna solicitud seleccionada</h3>
                            <p className="text-sm max-w-xs text-center mt-2 text-slate-500">
                                Selecciona una justificación de la lista de la izquierda para ver sus detalles y tomar acción.
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            <SuccessModal 
                open={showSuccessModal} 
                onOpenChange={setShowSuccessModal} 
                description={successMessage} 
            />

            <Dialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            {errorDialog.title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-700 pt-2">{errorDialog.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter><Button onClick={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}>Entendido</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}