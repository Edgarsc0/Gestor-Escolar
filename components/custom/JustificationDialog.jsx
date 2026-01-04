import { useState } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, X, FileText } from "lucide-react"
import { SuccessModal } from "./SuccessDialog"

export default function JustificationDialog({ incident, open, onOpenChange, onSuccess }) {
    const { user } = useAuth()
    const [showSuccess, setShowSuccess] = useState(false)
    const [reason, setReason] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [evidenceFiles, setEvidenceFiles] = useState([])

    const handleSubmit = async () => {
        if (!reason.trim()) {
            
            return;
        }
        setIsSaving(true)
        try {
            let evidenceUrls = []

            
            if (evidenceFiles.length > 0) {
               
                const CLOUD_NAME = "dcj0lp5nc" 
                const UPLOAD_PRESET = "Gestor Escolar" 

                const uploadPromises = evidenceFiles.map(async (file) => {
                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("upload_preset", UPLOAD_PRESET)

                    try {
                        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                            method: "POST",
                            body: formData
                        })
                        
                        if (uploadRes.ok) {
                            const data = await uploadRes.json()
                            return data.secure_url
                        }
                    } catch (uploadError) {
                        console.error("Error uploading evidence:", uploadError)
                    }
                    return null
                })

                const results = await Promise.all(uploadPromises)
                evidenceUrls = results.filter(url => url !== null)
            }

            const payload = {
                incident_id: incident.id,
                tutor_id: user.id,
                reason: reason,
                evidence_urls: evidenceUrls,
            }

            const res = await fetch('/api/justifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setShowSuccess(true)
            } else {
                
                console.error("Failed to submit justification")
            }
        } catch (error) {
            console.error("Error submitting justification:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSuccessClose = (isOpen) => {
        setShowSuccess(isOpen)
        if (!isOpen) {
            onSuccess() 
            onOpenChange(false)
            setReason("")
            setEvidenceFiles([])
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Justificar Incidencia de {incident?.type}</DialogTitle>
                    <DialogDescription>
                        Proporcione los detalles de la justificación para la incidencia del {incident?.date}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo</Label>
                        <Textarea 
                            id="reason" 
                            placeholder="Describa el motivo de la ausencia o conducta..." 
                            rows={4} 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="document">Documento de Soporte (Opcional)</Label>
                        <div className="flex flex-col gap-3">
                            <Input 
                                id="document" 
                                type="file" 
                                className="flex-1" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setEvidenceFiles(prev => [...prev, ...Array.from(e.target.files)])
                                    }
                                    e.target.value = "" 
                                }} 
                                accept="image/*,application/pdf"
                                multiple
                            />
                            
                            {evidenceFiles.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {evidenceFiles.map((file, index) => (
                                        <div key={index} className="relative group border border-slate-200 rounded-lg p-1 bg-slate-50">
                                            {file.type.startsWith('image/') ? (
                                                <img 
                                                    src={URL.createObjectURL(file)} 
                                                    alt="preview" 
                                                    className="w-full h-20 object-cover rounded-md"
                                                />
                                            ) : (
                                                <div className="w-full h-20 flex flex-col items-center justify-center">
                                                    <FileText className="h-8 w-8 text-slate-400 mb-1" />
                                                    <span className="text-[10px] text-slate-500 truncate w-full text-center px-1">{file.name}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== index))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                                type="button"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">Puedes subir múltiples archivos (JPG, PNG, PDF).</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : "Enviar Justificación"}
                    </Button>
                </DialogFooter>
            </DialogContent>

            <SuccessModal 
                open={showSuccess} 
                onOpenChange={handleSuccessClose} 
                description="La justificación ha sido enviada correctamente." 
            />
        </Dialog>
    )
}
