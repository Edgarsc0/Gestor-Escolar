import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollText } from "lucide-react"

export default function KardexTab({ kardexData }) {
    // Agrupar por ciclo escolar
    const groupedKardex = kardexData.reduce((acc, item) => {
        if (!acc[item.school_cycle]) {
            acc[item.school_cycle] = []
        }
        acc[item.school_cycle].push(item)
        return acc
    }, {})

    // Ordenar ciclos del más reciente al más antiguo
    const cycles = Object.keys(groupedKardex).sort().reverse()

    return (
        <div className="space-y-6">
            {cycles.length > 0 ? (
                cycles.map(cycle => (
                    <Card key={cycle} className="border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <ScrollText className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg font-medium text-slate-800">
                                    Ciclo Escolar {cycle}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Materia</TableHead>
                                        <TableHead>Grupo</TableHead>
                                        <TableHead className="text-center">P1</TableHead>
                                        <TableHead className="text-center">P2</TableHead>
                                        <TableHead className="text-center">P3</TableHead>
                                        <TableHead className="text-center pr-6">Final</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groupedKardex[cycle].map((grade, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium pl-6">{grade.subject_name}</TableCell>
                                            <TableCell className="text-slate-500">{grade.group_name || '-'}</TableCell>
                                            <TableCell className="text-center text-slate-600">{grade.partial_1 ?? '-'}</TableCell>
                                            <TableCell className="text-center text-slate-600">{grade.partial_2 ?? '-'}</TableCell>
                                            <TableCell className="text-center text-slate-600">{grade.partial_3 ?? '-'}</TableCell>
                                            <TableCell className="text-center pr-6">
                                                <Badge 
                                                    className={
                                                        grade.final_grade >= 6 
                                                            ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" 
                                                            : grade.final_grade != null 
                                                                ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                                                                : "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200"
                                                    }
                                                >
                                                    {grade.final_grade ?? '-'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Card className="border-dashed border-2">
                    <CardContent className="p-12 text-center text-slate-500">
                        <ScrollText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <h3 className="font-medium text-lg">Sin historial académico</h3>
                        <p>No se encontraron registros de calificaciones anteriores.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}