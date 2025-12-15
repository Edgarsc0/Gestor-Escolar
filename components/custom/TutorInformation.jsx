"use client"

import { useState } from "react"
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
import { User, Heart, Mail, Phone, MapPin, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ParentProfilePage() {
    const [isModified, setIsModified] = useState(false)
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

    // Read-only identity data
    const identityData = {
        fullName: "Mónica Gómez Hernández",
        relationship: "Madre/Tutora Legal",
    }

    // Editable contact information
    const [contactInfo, setContactInfo] = useState({
        personalEmail: "monica.gomez@email.com",
        mobilePhone: "+52 55 1234 5678",
        additionalPhone: "+52 55 8765 4321",
    })

    // Editable address information
    const [addressInfo, setAddressInfo] = useState({
        street: "Avenida Insurgentes Sur 1234",
        neighborhood: "Del Valle Centro",
        postalCode: "03100",
    })

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handleContactChange = (field, value) => {
        setContactInfo((prev) => ({ ...prev, [field]: value }))
        setIsModified(true)
    }

    const handleAddressChange = (field, value) => {
        setAddressInfo((prev) => ({ ...prev, [field]: value }))
        setIsModified(true)
    }

    const handleSaveChanges = () => {
        console.log("[v0] Saving changes...", { contactInfo, addressInfo })
        // Here you would typically save to backend
        setIsModified(false)
    }

    const handlePasswordUpdate = () => {
        console.log("[v0] Updating password...")
        // Here you would typically update password
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setIsPasswordDialogOpen(false)
    }

    return (
        <div className="pt-10 min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                        Mi Perfil y Datos de Contacto
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Actualiza tu información para asegurar la comunicación y la recuperación de cuenta
                    </p>
                </div>

                {/* Section 1: Identity Data (Read-only) */}
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <User className="h-5 w-5 text-blue-700" />
                            Datos de Identidad
                        </CardTitle>
                        <CardDescription className="text-slate-600">Información verificada por la institución</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-slate-700 font-medium">
                                <User className="h-4 w-4 text-blue-600" />
                                Nombre Completo
                            </Label>
                            <Input value={identityData.fullName} disabled className="bg-white/80 border-slate-200" />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-slate-700 font-medium">
                                <Heart className="h-4 w-4 text-rose-500" />
                                Relación con el Alumno
                            </Label>
                            <Input value={identityData.relationship} disabled className="bg-white/80 border-slate-200" />
                        </div>

                        <Alert className="bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                Estos datos solo pueden ser modificados por la administración
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Section 2: Contact Information (Editable) */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <Phone className="h-5 w-5 text-emerald-600" />
                            Información de Contacto
                        </CardTitle>
                        <CardDescription className="text-slate-600">Mantén actualizada tu información de contacto</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-slate-700 font-medium">
                                <Mail className="h-4 w-4 text-blue-600" />
                                Correo Electrónico Personal
                            </Label>
                            <Input
                                type="email"
                                value={contactInfo.personalEmail}
                                onChange={(e) => handleContactChange("personalEmail", e.target.value)}
                                placeholder="tu-email@ejemplo.com"
                                className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <p className="text-sm text-slate-500">Usado para recuperación de contraseña</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-slate-700 font-medium">
                                <Phone className="h-4 w-4 text-emerald-600" />
                                Teléfono Móvil
                            </Label>
                            <Input
                                type="tel"
                                value={contactInfo.mobilePhone}
                                onChange={(e) => handleContactChange("mobilePhone", e.target.value)}
                                placeholder="+52 55 1234 5678"
                                className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-slate-700 font-medium">
                                <Phone className="h-4 w-4 text-emerald-600" />
                                Teléfono Adicional
                            </Label>
                            <Input
                                type="tel"
                                value={contactInfo.additionalPhone}
                                onChange={(e) => handleContactChange("additionalPhone", e.target.value)}
                                placeholder="+52 55 8765 4321 (Opcional)"
                                className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <p className="text-sm text-slate-500">Teléfono de trabajo o casa (Opcional)</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Address Information (Editable) */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Dirección y Domicilio
                        </CardTitle>
                        <CardDescription className="text-slate-600">Información de tu ubicación</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Calle y Número</Label>
                            <Input
                                value={addressInfo.street}
                                onChange={(e) => handleAddressChange("street", e.target.value)}
                                placeholder="Avenida Principal 123"
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Colonia/Barrio</Label>
                            <Input
                                value={addressInfo.neighborhood}
                                onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                                placeholder="Centro"
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-slate-700 font-medium">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Código Postal
                            </Label>
                            <Input
                                value={addressInfo.postalCode}
                                onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                                placeholder="12345"
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Section 4: Security (Password Change) */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent">
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <Lock className="h-5 w-5 text-slate-700" />
                            Seguridad
                        </CardTitle>
                        <CardDescription className="text-slate-600">Gestiona tu contraseña de acceso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto border-slate-300 hover:bg-slate-50 text-slate-700 bg-transparent"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Cambiar Contraseña
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
                                    <Button onClick={handlePasswordUpdate} className="bg-blue-700 hover:bg-blue-800 text-white">
                                        Actualizar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Save Action */}
                <div className="flex justify-end pt-4">
                    <Button
                        size="lg"
                        disabled={!isModified}
                        onClick={handleSaveChanges}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:bg-slate-300"
                    >
                        Guardar Todos los Cambios
                    </Button>
                </div>
            </div>
        </div>
    )
}
