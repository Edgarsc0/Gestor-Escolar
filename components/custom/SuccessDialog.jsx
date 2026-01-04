
"use client"

import { CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function SuccessModal({ open, onOpenChange, title = "¡Éxito!", description }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-green-100 p-3 mb-2">
                        <CheckCircle className="h-12 w-12 text-green-600 animate-in zoom-in-50 duration-300" />
                    </div>
                    <DialogTitle className="text-center text-xl">{title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {description}
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
