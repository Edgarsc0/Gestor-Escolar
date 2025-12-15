import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function ProfileTab({ studentData, setStudentData, emergencyContacts, setEmergencyContacts }) {
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
    const [editingContactIndex, setEditingContactIndex] = useState(null)
    const [contactForm, setContactForm] = useState({ name: "", relation: "", phone: "" })

    const handleAddContact = () => {
        setContactForm({ name: "", relation: "", phone: "" })
        setEditingContactIndex(null)
        setIsContactDialogOpen(true)
    }

    const handleEditContact = (contact, index) => {
        setContactForm(contact)
        setEditingContactIndex(index)
        setIsContactDialogOpen(true)
    }

    const handleSaveContact = () => {
        if (editingContactIndex !== null) {
            const updatedContacts = [...emergencyContacts]
            updatedContacts[editingContactIndex] = contactForm
            setEmergencyContacts(updatedContacts)
        } else {
            setEmergencyContacts([...emergencyContacts, contactForm])
        }
        setIsContactDialogOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Student Data */}
            <Card>
                <CardHeader>
                    <CardTitle>Datos del Alumno</CardTitle>
                    <CardDescription>Información médica y personal</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bloodType">Tipo de Sangre</Label>
                                <Input
                                    id="bloodType"
                                    value={studentData.bloodType}
                                    onChange={(e) =>
                                        setStudentData({
                                            ...studentData,
                                            bloodType: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="allergies">Alergias</Label>
                                <Input
                                    id="allergies"
                                    value={studentData.allergies}
                                    onChange={(e) =>
                                        setStudentData({
                                            ...studentData,
                                            allergies: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
                <CardHeader>
                    <CardTitle>Contactos de Emergencia</CardTitle>
                    <CardDescription>Personas autorizadas para recoger al alumno</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {emergencyContacts.map((contact, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-slate-900">{contact.name}</h3>
                                    <p className="text-sm text-slate-600">
                                        {contact.relation} • {contact.phone}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
                                    onClick={() => handleEditContact(contact, index)}
                                >
                                    Editar
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="w-full border-dashed border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 bg-transparent"
                            onClick={handleAddContact}
                        >
                            Agregar Contacto
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingContactIndex !== null ? "Editar Contacto" : "Agregar Contacto"}</DialogTitle>
                        <DialogDescription>
                            Ingrese los datos del contacto de emergencia.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactName">Nombre Completo</Label>
                            <Input
                                id="contactName"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactRelation">Parentesco</Label>
                            <Input
                                id="contactRelation"
                                value={contactForm.relation}
                                onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Teléfono</Label>
                            <Input
                                id="contactPhone"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveContact} className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
