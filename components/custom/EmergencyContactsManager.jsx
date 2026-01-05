"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Save, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function EmergencyContactsManager({ userId, readOnly = false }) {
    const [contacts, setContacts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [newContact, setNewContact] = useState({ contact_name: "", relationship: "", phone_number: "" })
    const [contactToDelete, setContactToDelete] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (userId) fetchContacts()
    }, [userId])

    const fetchContacts = async () => {
        try {
            const res = await fetch(`/api/emergency_contacts/user/${userId}`)
            if (res.ok) {
                setContacts(await res.json())
            }
        } catch (error) {
            console.error("Error fetching contacts:", error)
            toast.error("Error al cargar contactos")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!newContact.contact_name || !newContact.relationship || !newContact.phone_number) {
            toast.error("Todos los campos son obligatorios")
            return
        }
        if (!/^\d{10}$/.test(newContact.phone_number)) {
            toast.error("El teléfono debe tener 10 dígitos numéricos")
            return
        }

        setIsSaving(true)
        try {
            const res = await fetch('/api/emergency_contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newContact, user_id: userId })
            })

            if (res.ok) {
                const saved = await res.json()
                setContacts([...contacts, saved])
                setNewContact({ contact_name: "", relationship: "", phone_number: "" })
                setIsAdding(false)
                toast.success("Contacto agregado")
            } else {
                toast.error("Error al guardar contacto")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!contactToDelete) return

        try {
            const res = await fetch(`/api/emergency_contacts/${contactToDelete.id}`, { method: 'DELETE' })
            if (res.ok) {
                setContacts(contacts.filter(c => c.id !== contactToDelete.id))
                toast.success("Contacto eliminado")
            } else {
                toast.error("Error al eliminar")
            }
        } catch (error) {
            toast.error("Error de conexión")
        } finally {
            setContactToDelete(null)
        }
    }

    if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-slate-700">Lista de Contactos</h3>
                {!readOnly && !isAdding && (
                    <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-3 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Nombre Completo</Label>
                                <Input value={newContact.contact_name} onChange={e => setNewContact({...newContact, contact_name: e.target.value})} placeholder="Ej. María Pérez" className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Parentesco</Label>
                                <Input value={newContact.relationship} onChange={e => setNewContact({...newContact, relationship: e.target.value})} placeholder="Ej. Madre" className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Teléfono (10 dígitos)</Label>
                                <Input value={newContact.phone_number} onChange={e => setNewContact({...newContact, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10)})} placeholder="5512345678" className="h-8 text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button size="sm" onClick={handleAdd} disabled={isSaving}>{isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />} Guardar</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader><TableRow className="bg-slate-50"><TableHead className="py-2">Nombre</TableHead><TableHead className="py-2">Parentesco</TableHead><TableHead className="py-2">Teléfono</TableHead>{!readOnly && <TableHead className="py-2 text-right">Acciones</TableHead>}</TableRow></TableHeader>
                    <TableBody>
                        {contacts.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">No hay contactos registrados.</TableCell></TableRow> : contacts.map(contact => (
                            <TableRow key={contact.id}><TableCell className="py-2 font-medium">{contact.contact_name}</TableCell><TableCell className="py-2">{contact.relationship}</TableCell><TableCell className="py-2 font-mono text-xs">{contact.phone_number}</TableCell>{!readOnly && <TableCell className="py-2 text-right"><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => setContactToDelete(contact)}><Trash2 className="h-3 w-3" /></Button></TableCell>}</TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Confirmar Eliminación
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            ¿Estás seguro de que deseas eliminar a <strong>{contactToDelete?.contact_name}</strong> de la lista de contactos de emergencia? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setContactToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}