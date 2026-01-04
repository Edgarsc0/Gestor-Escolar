// /home/edgar/Proyecto ADS/proyecto_ads/components/custom/LoadingOverlay.jsx
"use client"
import { Loader2 } from "lucide-react"

export function LoadingOverlay({ message = "Cargando..." }) {
    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm">
            <Loader2 className="h-16 w-16 animate-spin text-white mb-4" />
            <p className="text-white text-lg font-medium animate-pulse">{message}</p>
        </div>
    )
}
