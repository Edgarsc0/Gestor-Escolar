"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { User, Mail, Phone, MapPin, Lock, AlertCircle, Loader2, Heart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SuccessModal } from "./SuccessDialog"
import { LoadingOverlay } from "./LoadingOverlay"

export default function TutorInformation({ userId, userName }) {
    const { user } = useAuth()
    const effectiveUserId = userId || user?.id
    const isOwnProfile = !userId || (user && String(userId) === String(user.id))

    const [isModified, setIsModified] = useState(false)
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")

    // Read-only identity data
    const [identityData, setIdentityData] = useState({
        fullName: "",
    })

    // Editable contact information
    const [contactInfo, setContactInfo] = useState({
        personal_email: "",
        cell_phone: "",
        additional_phone: "",
    })

    // Editable address information
    const [addressInfo, setAddressInfo] = useState({
        street_address: "",
        neighborhood: "",
        postal_code: "",
    })

    // Editable medical information
    const [medicalInfo, setMedicalInfo] = useState({
        blood_type: "",
        allergies: "",
    })

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    useEffect(() => {
        if (effectiveUserId) {
            if (isOwnProfile && user) {                
                setIdentityData(prev => ({ ...prev, fullName: user.full_name }))
            } else if (userName) {
                setIdentityData(prev => ({ ...prev, fullName: userName }))
            }

            const fetchPersonalInfo = async () => {
                setIsLoading(true)
                try {
                    const res = await fetch(`/api/personal_info/${effectiveUserId}`)
                    if (res.ok) {
                        const data = await res.json()
                        setContactInfo({
                            personal_email: data.personal_email || "",
                            cell_phone: data.cell_phone || "",
                            additional_phone: data.additional_phone || "",
                        })
                        setAddressInfo({
                            street_address: data.street_address || "",
                            neighborhood: data.neighborhood || "",
                            postal_code: data.postal_code || "",
                        })
                        setMedicalInfo({
                            blood_type: data.blood_type || "",
                            allergies: data.allergies || "",
                        })
                    }
                } catch (error) {
                    console.error("Failed to fetch personal info", error)
                    setErrorDialog({ isOpen: true, title: "Error de Carga", description: "No se pudo cargar la información personal." })
                } finally {
                    setIsLoading(false)
                }
            }
            fetchPersonalInfo()
        }
    }, [effectiveUserId, user, isOwnProfile, userName])

    const handleContactChange = (field, value) => {
        setContactInfo((prev) => ({ ...prev, [field]: value }))
        setIsModified(true)
    }

    const handleAddressChange = (field, value) => {
        setAddressInfo((prev) => ({ ...prev, [field]: value }))
        setIsModified(true)
    }

    const handleMedicalChange = (field, value) => {
        setMedicalInfo((prev) => ({ ...prev, [field]: value }))
        setIsModified(true)
    }

    const handleSaveChanges = async () => {
        if (!effectiveUserId) return
        setIsSaving(true)
        try {
            const payload = { ...contactInfo, ...addressInfo, ...medicalInfo }
            const res = await fetch(`/api/personal_info/${effectiveUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setIsModified(false)
                setSuccessMessage("La información personal ha sido actualizada correctamente.")
                setShowSuccessModal(true)
            } else {
                const errorData = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al Guardar", description: errorData.error || "No se pudieron guardar los cambios." })
            }
        } catch (error) {
            console.error("Error saving changes:", error)
            setErrorDialog({ isOpen: true, title: "Error de Conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorDialog({ isOpen: true, title: "Error de Contraseña", description: "Las nuevas contraseñas no coinciden." })
            return
        }
        if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
            setErrorDialog({ isOpen: true, title: "Error de Contraseña", description: "La nueva contraseña debe tener al menos 6 caracteres." })
            return
        }

        setIsSaving(true)
        try {
            const payload = {
                userId: user.id,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }
            const res = await fetch('/api/auth/change_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                setIsPasswordDialogOpen(false)
                setSuccessMessage("La contraseña ha sido actualizada correctamente.")
                setShowSuccessModal(true)
            } else {
                const errorData = await res.json()
                setErrorDialog({ isOpen: true, title: "Error al Cambiar Contraseña", description: errorData.error || "Ocurrió un error." })
            }
        } catch (error) {
            console.error("Error updating password:", error)
            setErrorDialog({ isOpen: true, title: "Error de Conexión", description: "No se pudo conectar con el servidor." })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-slate-50/50 mt-10">
            {(isLoading || isSaving) && <LoadingOverlay message={isSaving ? "Guardando cambios..." : "Cargando información..."} />}
            
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isOwnProfile ? "Mi Perfil y Datos de Contacto" : "Perfil del Alumno"}
                    </h1>
                    <p className="text-slate-500 text-lg">
                        {isOwnProfile ? "Actualiza tu información para asegurar la comunicación" : "Gestiona la información personal y médica del alumno"}
                    </p>
                </div>

                {/* Section 1: Identity Data (Read-only) */}
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium text-slate-900">Datos de Identidad</CardTitle>
                                <CardDescription>Información verificada por la institución</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-700">Nombre Completo</Label>
                                <Input value={identityData.fullName} disabled className="bg-slate-50 border-slate-200 text-slate-600" />
                            </div>
                        </div>

                        <Alert className="bg-blue-50 border-blue-100 text-blue-800">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription>
                                Estos datos solo pueden ser modificados por la administración escolar.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Section 2: Contact Information (Editable) */}
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Phone className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium text-slate-900">Información de Contacto</CardTitle>
                                <CardDescription>Medios para comunicarnos contigo</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-700">Correo Electrónico Personal</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={contactInfo.personal_email}
                                        onChange={(e) => handleContactChange("personal_email", e.target.value)}
                                        placeholder="tu-email@ejemplo.com"
                                        className="pl-9 border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Usado para recuperación de contraseña</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Teléfono Móvil</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="tel"
                                        value={contactInfo.cell_phone}
                                        onChange={(e) => handleContactChange("cell_phone", e.target.value)}
                                        placeholder="+52 55 1234 5678"
                                        className="pl-9 border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Teléfono Adicional</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="tel"
                                        value={contactInfo.additional_phone}
                                        onChange={(e) => handleContactChange("additional_phone", e.target.value)}
                                        placeholder="+52 55 8765 4321 (Opcional)"
                                        className="pl-9 border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Address Information (Editable) */}
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium text-slate-900">Dirección y Domicilio</CardTitle>
                                <CardDescription>Información de tu ubicación</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-700">Calle y Número</Label>
                                <Input
                                    value={addressInfo.street_address}
                                    onChange={(e) => handleAddressChange("street_address", e.target.value)}
                                    placeholder="Avenida Principal 123"
                                    className="border-slate-200 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Colonia/Barrio</Label>
                                <Input
                                    value={addressInfo.neighborhood}
                                    onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                                    placeholder="Centro"
                                    className="border-slate-200 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Código Postal</Label>
                                <Input
                                    value={addressInfo.postal_code}
                                    onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                                    placeholder="12345"
                                    className="border-slate-200 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 4: Medical Information (Editable) */}
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium text-slate-900">Información Médica</CardTitle>
                                <CardDescription>Datos importantes para emergencias</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Tipo de Sangre</Label>
                                <Input
                                    value={medicalInfo.blood_type}
                                    onChange={(e) => handleMedicalChange("blood_type", e.target.value)}
                                    placeholder="Ej. O+"
                                    className="border-slate-200 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Alergias</Label>
                                <Input
                                    value={medicalInfo.allergies}
                                    onChange={(e) => handleMedicalChange("allergies", e.target.value)}
                                    placeholder="Ej. Penicilina, Polen (o 'Ninguna')"
                                    className="border-slate-200 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 5: Security (Password Change) */}
                {isOwnProfile && (
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium text-slate-900">Seguridad</CardTitle>
                                <CardDescription>Gestiona tu contraseña de acceso</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <p className="font-medium text-slate-900">Contraseña</p>
                                <p className="text-sm text-slate-500">Se recomienda cambiarla periódicamente</p>
                            </div>
                            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="bg-white border-slate-200 hover:bg-slate-50">
                                        Cambiar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="border-slate-200">
                                    <DialogHeader>
                                        <DialogTitle className="text-slate-900">Actualizar Contraseña</DialogTitle>
                                        <DialogDescription className="text-slate-600">
                                            Ingresa tu contraseña actual y elige una nueva contraseña segura
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password" className="text-slate-700 font-medium">
                                                Contraseña Actual
                                            </Label>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                                placeholder="••••••••"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="new-password" className="text-slate-700 font-medium">
                                                Nueva Contraseña
                                            </Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                                                placeholder="••••••••"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password" className="text-slate-700 font-medium">
                                                Confirmar Nueva Contraseña
                                            </Label>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                                placeholder="••••••••"
                                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsPasswordDialogOpen(false)}
                                            className="border-slate-300 hover:bg-slate-50"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button onClick={handlePasswordUpdate} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                            {isSaving ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Actualizando...</>
                                            ) : "Actualizar"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
                )}

                {/* Save Action */}
                <div className="flex justify-end pt-4 pb-10">
                    <Button
                        size="lg"
                        disabled={!isModified}
                        onClick={handleSaveChanges}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-slate-300 min-w-[150px]"
                    >
                        {isSaving ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
                        ) : "Guardar Todos los Cambios"}
                    </Button>
                </div>

                <Dialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                {errorDialog.title}
                            </DialogTitle>
                            <DialogDescription className="text-slate-700 pt-2">
                                {errorDialog.description}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}>Entendido</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <SuccessModal 
                open={showSuccessModal} 
                onOpenChange={setShowSuccessModal} 
                description={successMessage} 
            />
        </div>
    )
}
