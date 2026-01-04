import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle2, FileDown, AlertCircle, Loader2 } from "lucide-react"
import { LoadingOverlay } from "@/components/custom/LoadingOverlay"

export function UploadView() {
    const [uploadStep, setUploadStep] = useState(1)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [csvData, setCsvData] = useState([])
    const [uploadResults, setUploadResults] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: "", description: "" })

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            setUploadProgress(0)
            
            // Simular progreso visual
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            const reader = new FileReader()
            reader.onload = (e) => {
                const text = e.target.result
                const rows = parseCSV(text)
                setCsvData(rows)
                clearInterval(interval)
                setUploadProgress(100)
                setTimeout(() => setUploadStep(2), 500)
            }
            reader.readAsText(file)
        }
    }

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(l => l.trim())
       
        return lines.slice(1).map((line, index) => {
            const cols = line.split(',').map(c => c.trim())
            const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            
            // Validación básica
            let status = "valid"
            if (!cols[0] || !cols[3] || !cols[6]) status = "error" // Campos requeridos faltantes
            if (cols[5] && !isValidEmail(cols[5])) status = "error" // Email tutor inválido

            return {
                row: index + 1,
                student_name: cols[0],
                student_dob: cols[1],
                student_email: cols[2],
                tutor_name: cols[3],
                tutor_dob: cols[4],
                tutor_email: cols[5],
                relation: cols[6],
                status
            }
        })
    }

    const handleProcessUpload = async () => {
        setIsUploading(true)
        setUploadProgress(0)
        
        const validRows = csvData.filter(r => r.status === 'valid')
        const totalRows = validRows.length
        const batchSize = 5 // Procesar en lotes pequeños para mostrar progreso real
        
        let resultsAccumulator = {
            studentsCreated: 0,
            tutorsCreated: 0,
            relationshipsCreated: 0,
            errors: 0,
            details: []
        }

        try {
            for (let i = 0; i < totalRows; i += batchSize) {
                const batch = validRows.slice(i, i + batchSize)
                
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rows: batch })
                })
                
                if (res.ok) {
                    const batchResult = await res.json()
                    resultsAccumulator.studentsCreated += batchResult.studentsCreated
                    resultsAccumulator.tutorsCreated += batchResult.tutorsCreated
                    resultsAccumulator.relationshipsCreated += batchResult.relationshipsCreated
                    resultsAccumulator.errors += batchResult.errors
                    resultsAccumulator.details = [...resultsAccumulator.details, ...batchResult.details]
                } else {
                    resultsAccumulator.errors += batch.length
                    batch.forEach(r => resultsAccumulator.details.push({ 
                        row: r.row, 
                        error: `Error en el lote: ${res.statusText}` 
                    }))
                }

                // Actualizar progreso
                const currentProgress = Math.round(((i + batch.length) / totalRows) * 100)
                setUploadProgress(currentProgress)
            }
            
            setUploadResults(resultsAccumulator)
            setUploadStep(3)
        } catch (error) {
            console.error("Upload failed:", error)
            setErrorDialog({ isOpen: true, title: "Error de carga", description: "Ocurrió un error inesperado al procesar el archivo." })
        } finally {
            setIsUploading(false)
        }
    }

    const downloadTemplate = () => {
        const headers = "Nombre Alumno,Fecha Nacimiento Alumno (YYYY-MM-DD),Email Alumno,Nombre Tutor,Fecha Nacimiento Tutor (YYYY-MM-DD),Email Tutor,Parentesco"
        const examples = [
            "Valentina Ruiz,2015-03-10,,Pedro Ruiz,1980-05-15,,Padre",
            "Santiago Morales,2016-07-22,,Ana Morales,1982-09-30,,Madre",
            "Mateo Castillo,2014-11-05,,Luis Castillo,1978-02-14,,Padre",
            "Sofía Herrera,2015-01-18,,Carmen Herrera,1985-06-20,,Madre",
            "Sebastián Vargas,2016-09-12,,Jorge Vargas,1979-12-05,,Padre",
            "Camila Rojas,2014-04-30,,Elena Rojas,1983-08-10,,Madre",
            "Leonardo Mendoza,2015-06-25,,Ricardo Mendoza,1981-03-18,,Padre",
            "Isabella Cruz,2016-02-14,,Patricia Cruz,1984-11-22,,Madre",
            "Emiliano Flores,2014-08-08,,Fernando Flores,1977-07-07,,Padre",
            "Luciana Ortiz,2015-10-03,,Gabriela Ortiz,1986-04-25,,Madre"
        ]
        const content = `${headers}\n${examples.join("\n")}`
        const blob = new Blob([content], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = "plantilla_carga_masiva.csv"
        a.click()
    }

    return (
        <Card className="max-w-4xl mx-auto border-slate-200">
            {isUploading && <LoadingOverlay message="Procesando archivo..." />}
            
            <CardHeader>
                <CardTitle className="text-lg">Asistente de Importación Masiva</CardTitle>
                <div className="flex items-center gap-2 mt-4">
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                            }`}
                    >
                        1
                    </div>
                    <div className={`flex-1 h-1 ${uploadStep >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                            }`}
                    >
                        2
                    </div>
                    <div className={`flex-1 h-1 ${uploadStep >= 3 ? "bg-blue-600" : "bg-slate-200"}`} />
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${uploadStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                            }`}
                    >
                        3
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Step 1: Upload */}
                {uploadStep === 1 && (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                            <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                            <p className="text-lg font-medium text-slate-700 mb-2">
                                Sube tu archivo CSV con datos de Alumnos y Tutores
                            </p>
                            <p className="text-sm text-slate-500 mb-4">
                                Arrastra y suelta tu archivo aquí, o haz clic para seleccionar
                            </p>
                            <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs mx-auto" />
                        </div>
                        <div className="text-center">
                            <Button variant="link" onClick={downloadTemplate} className="text-blue-600">
                                <FileDown className="h-4 w-4 mr-2" />
                                Descargar plantilla de ejemplo
                            </Button>
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Subiendo archivo...</span>
                                    <span className="text-slate-900 font-medium">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Review */}
                {uploadStep === 2 && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-blue-900">Datos Detectados</p>
                                    <p className="text-sm text-blue-700">Se encontraron {csvData.length} registros para procesar</p>
                                </div>
                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fila</TableHead>
                                        <TableHead>Alumno</TableHead>
                                        <TableHead>Tutor</TableHead>
                                        <TableHead>Relación</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {csvData.map((row) => (
                                        <TableRow key={row.row} className={row.status === "error" ? "bg-red-50" : ""}>
                                            <TableCell>{row.row}</TableCell>
                                            <TableCell className="font-medium">{row.student_name}</TableCell>
                                            <TableCell>{row.tutor_name}</TableCell>
                                            <TableCell>
                                                <span className="text-sm text-slate-600">
                                                    {row.relation}
                                                </span>
                                            </TableCell>
                                            <TableCell>{row.tutor_email}</TableCell>
                                            <TableCell>
                                                {row.status === "valid" ? (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200">Válido</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 border-red-200">
                                                        Datos incompletos
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {isUploading && (
                            <div className="space-y-2 pt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Insertando registros en base de datos...</span>
                                    <span className="text-slate-900 font-medium">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setUploadStep(1)} disabled={isUploading}>
                                Volver
                            </Button>
                            <Button onClick={handleProcessUpload} disabled={isUploading || csvData.filter(r => r.status === 'valid').length === 0} className="bg-blue-600 hover:bg-blue-700">
                                {isUploading ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Procesando...</>
                                ) : (
                                    "Continuar a Importación"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Finish */}
                {uploadStep === 3 && (
                    <div className="space-y-4 text-center py-8">
                        <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
                        <h3 className="text-xl font-bold text-slate-900">Importación Completada</h3>
                        <div className="bg-slate-50 rounded-lg p-6 max-w-md mx-auto">
                            <div className="space-y-2 text-left">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Estudiantes creados:</span>
                                    <span className="font-medium text-slate-900">{uploadResults?.studentsCreated || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Tutores creados:</span>
                                    <span className="font-medium text-slate-900">{uploadResults?.tutorsCreated || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Relaciones establecidas:</span>
                                    <span className="font-medium text-slate-900">{uploadResults?.relationshipsCreated || 0}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Errores:</span>
                                    <span className="font-medium">{uploadResults?.errors || 0}</span>
                                </div>
                            </div>
                        </div>

                        {uploadResults?.details && uploadResults.details.length > 0 && (
                            <div className="mt-6 border border-red-200 rounded-lg overflow-hidden text-left">
                                <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                                    <h4 className="text-sm font-medium text-red-800 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Detalle de Errores
                                    </h4>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-24">Fila CSV</TableHead>
                                                <TableHead>Descripción del Error</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {uploadResults.details.map((detail, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{detail.row}</TableCell>
                                                    <TableCell className="text-red-600 text-sm">{detail.error}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={() => {
                                setUploadStep(1)
                                setUploadProgress(0)
                                setCsvData([])
                                setUploadResults(null)
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Nueva Importación
                        </Button>
                    </div>
                )}
            </CardContent>

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
        </Card>
    )
}