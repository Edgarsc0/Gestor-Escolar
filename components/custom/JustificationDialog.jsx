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
import { Upload } from "lucide-react"

export default function JustificationDialog({ open, onOpenChange }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Justificar Incidencia</DialogTitle>
                    <DialogDescription>Proporcione los detalles de la justificación para esta incidencia</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo</Label>
                        <Textarea id="reason" placeholder="Describa el motivo de la ausencia o conducta..." rows={4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="document">Documento de Soporte (Opcional)</Label>
                        <div className="flex items-center gap-2">
                            <Input id="document" type="file" className="flex-1" />
                            <Button size="icon" variant="outline">
                                <Upload className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => onOpenChange(false)}>
                        Enviar Justificación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
