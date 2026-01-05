"use client"

import React, { useState } from 'react'
import { 
    Document, 
    Page, 
    Text, 
    View, 
    StyleSheet, 
    pdf, 
    Image 
} from '@react-pdf/renderer'
import { Button } from "@/components/ui/button"
import { FileText, Loader2, Lock } from "lucide-react"
import { useAuth } from "@/contexts/useAuth"
import { toast } from "sonner" // O tu sistema de notificaciones preferido
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// --- 1. ESTILOS Y DISEÑO DEL PDF ---
const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 10,
    },
    schoolName: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        textDecoration: 'underline',
    },
    body: {
        textAlign: 'justify',
        marginBottom: 20,
    },
    studentName: {
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 50,
        right: 50,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
        fontSize: 10,
        color: '#666',
    },
    signatureSection: {
        marginTop: 80,
        alignItems: 'center',
    },
    signatureLine: {
        width: 200,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginBottom: 5,
    },
    date: {
        textAlign: 'right',
        marginBottom: 20,
        fontSize: 11,
    }
});

// Componente del Documento PDF
const CertificateDocument = ({ studentData, cycleData }) => {
    const currentDate = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Encabezado */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.schoolName}>Instituto Educativo</Text>
                        <Text style={{ fontSize: 10 }}>"Excelencia y Futuro"</Text>
                        <Text style={{ fontSize: 10 }}>Clave C.C.T: 09PES0123X</Text>
                    </View>
                    {/* Aquí podrías poner un componente <Image src="..." /> con el logo */}
                </View>

                {/* Fecha */}
                <Text style={styles.date}>
                    Ciudad de México, a {currentDate}
                </Text>

                {/* Título */}
                <Text style={styles.title}>CONSTANCIA DE ESTUDIOS</Text>

                {/* Cuerpo del texto */}
                <Text style={styles.body}>
                    A QUIEN CORRESPONDA:
                </Text>

                <Text style={styles.body}>
                    La Dirección Escolar del Instituto Educativo hace constar que el alumno(a):
                </Text>

                <Text style={[styles.body, { textAlign: 'center', fontSize: 14, fontWeight: 'bold', marginVertical: 10 }]}>
                    {studentData.name}
                </Text>

                <Text style={styles.body}>
                    Con número de matrícula <Text style={{ fontWeight: 'bold' }}>{studentData.id}</Text>, se encuentra legalmente inscrito(a) en el ciclo escolar <Text style={{ fontWeight: 'bold' }}>{cycleData.currentCycle}</Text>, cursando actualmente el nivel <Text style={{ fontWeight: 'bold' }}>{studentData.level}</Text>.
                </Text>

                <Text style={styles.body}>
                    El alumno(a) mantiene un estatus regular y cumple con las disposiciones académicas y administrativas de la institución hasta la fecha de expedición del presente documento.
                </Text>

                <Text style={styles.body}>
                    Se extiende la presente a petición del interesado para los fines legales y administrativos que a su derecho convengan.
                </Text>

                {/* Firmas */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureLine} />
                    <Text style={{ fontWeight: 'bold' }}>Lic. María González Pérez</Text>
                    <Text>Directora de Control Escolar</Text>
                </View>

                {/* Pie de página */}
                <View style={styles.footer}>
                    <Text>Av. Principal #123, Col. Centro, CP 06000, CDMX | Tel: 55-1234-5678</Text>
                    <Text>Este documento es válido sin tachaduras ni enmendaduras.</Text>
                </View>
            </Page>
        </Document>
    );
};

// --- 2. COMPONENTE LÓGICO (BOTÓN) ---
export default function CertificateDownloadButton({ 
    studentId, 
    studentName, 
    studentLevel, 
    hasAdministrativeBlock = false // Prop simulada para ERR11
}) {
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", msg: "" });

    // Definimos qué niveles se consideran "Educación Básica" (Tutor Elemental)
    const basicLevels = ["kinder", "kínder", "preescolar", "primaria", "secundaria"];
    const superiorLevels = ["prepa", "bachillerato", "preparatoria", "universidad"];

    const handleDownload = async () => {
        setIsGenerating(true);

        // --- VALIDACIÓN 1: REGLA DE NEGOCIO RN12 (Permisos de Rol) ---
        const userRole = (user?.role || "").toLowerCase();
        const level = (studentLevel || "").toLowerCase();

        // Si es Tutor y el alumno es de Prepa/Uni -> ERROR (Debe hacerlo el alumno)
        if (["padre", "tutor"].includes(userRole)) {
            const isBasic = basicLevels.some(l => level.includes(l));
            if (!isBasic) {
                setIsGenerating(false);
                setErrorDialog({
                    isOpen: true,
                    title: "Permiso Denegado",
                    msg: "Como tutor, solo puedes descargar constancias de Educación Básica (Kinder - Secundaria). Los alumnos de Media Superior y Superior deben gestionar sus propios documentos."
                });
                return;
            }
        }

        // --- VALIDACIÓN 2: BLOQUEO ADMINISTRATIVO (ERR11) ---
        // Precondición: El alumno no debe tener bloqueos.
        if (hasAdministrativeBlock) {
            setIsGenerating(false);
            // MSG-9.1 (Simulado según especificación)
            setErrorDialog({
                isOpen: true,
                title: "Bloqueo Administrativo",
                msg: "El alumno presenta un bloqueo administrativo (adeudo o documentación pendiente). Por favor, acuda a control escolar para regularizar su situación."
            });
            return;
        }

        // --- VALIDACIÓN 3: DATOS FALTANTES (ERR0) ---
        if (!studentId || !studentName) {
            setIsGenerating(false);
            setErrorDialog({
                isOpen: true,
                title: "Error de Datos",
                msg: "No se encuentra la información del alumno asociado."
            });
            return;
        }

        try {
            // --- GENERACIÓN DEL PDF ---
            // Simulamos datos del ciclo escolar (esto vendría de tu BD o Props)
            const cycleData = { currentCycle: "2025 - 2026" };
            
            // Creamos el blob del PDF
            const blob = await pdf(
                <CertificateDocument 
                    studentData={{ name: studentName, id: studentId, level: studentLevel }} 
                    cycleData={cycleData} 
                />
            ).toBlob();

            // Creamos una URL temporal y forzamos la descarga
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Constancia_${studentId}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Constancia generada correctamente");

        } catch (error) {
            console.error("Error generating PDF:", error);
            // --- MANEJO DE ERROR TÉCNICO (ERR12) ---
            setErrorDialog({
                isOpen: true,
                title: "Error del Sistema",
                msg: "Ocurrió un error al generar el documento PDF. Intente nuevamente más tarde."
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <Button 
                onClick={handleDownload} 
                disabled={isGenerating}
                variant="outline"
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-blue-700 w-full sm:w-auto"
            >
                {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : hasAdministrativeBlock ? (
                    <Lock className="h-4 w-4 text-red-500" />
                ) : (
                    <FileText className="h-4 w-4" />
                )}
                
                {isGenerating ? "Generando..." : "Descargar Constancia"}
            </Button>

            {/* Modal de Errores (MSG-9.1, MSG-9.2) */}
            <AlertDialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                            {errorDialog.title === "Bloqueo Administrativo" && <Lock className="h-5 w-5" />}
                            {errorDialog.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-700 mt-2">
                            {errorDialog.msg}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}>
                            Aceptar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}