import { Fragment } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ScheduleTab({ classes = [], isLoading }) {
    const timeSlots = [
        "07:00 - 08:00",
        "08:00 - 09:00",
        "09:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "12:00 - 13:00",
        "13:00 - 14:00"
    ]
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

    console.log(classes)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Horario de Clases</CardTitle>
                <CardDescription>Horario semanal completo del alumno</CardDescription>
            </CardHeader>
            <CardContent>
                
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">

                            {/* Legend */}
                            <div className="mt-6 mb-6 pt-6 border-t border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Materias Inscritas</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {[...new Set(classes.map(c => c.subject_name))].map((subject) => (
                                        <div key={subject} className={`p-2 rounded text-xs font-medium ${subject === "Receso" ? "bg-slate-200 text-slate-700" : "bg-blue-50 text-blue-900 border-l-4 border-l-blue-500"} truncate`}>
                                            {subject || "Sin nombre"}
                                        </div>
                                    ))}
                                    {classes.length === 0 && (
                                        <p className="text-xs text-slate-400 col-span-5">No hay materias registradas en el horario.</p>
                                    )}
                                </div>
                            </div>

                            {/* Schedule Grid */}
                            <div className="grid grid-cols-6 gap-2">
                                {/* Header Row */}
                                <div className="font-semibold text-sm text-slate-700 p-3 bg-slate-100 rounded-lg text-center">Hora</div>

                                {days.map((day) => (
                                    <div
                                        key={day}
                                        className="font-semibold text-sm text-slate-700 p-3 bg-slate-100 rounded-lg text-center"
                                    >
                                        {day}
                                    </div>
                                ))}

                                {/* Schedule Rows */}
                                {timeSlots.map((time, timeIndex) => (
                                    <Fragment key={time}>
                                        {/* Time Column */}
                                        <div className="text-xs text-slate-600 p-3 bg-slate-50 rounded-lg flex items-center justify-center font-medium">{time}</div>

                                        {/* Class Cells */}
                                        {days.map((day) => {
                                            // Normalizar formato de hora para comparación (ej. "07:00:00" -> "07:00")
                                            const [slotStart] = time.split(' - ');

                                            const classInfo = classes.find(c => {
                                                // Normalizar hora de DB (ej: "8:00" -> "08:00") para asegurar coincidencia
                                                const parts = c.start_time.split(':');
                                                const dbStart = `${parts[0].padStart(2, '0')}:${parts[1]}`;
                                                return c.day_of_week === day && dbStart === slotStart;
                                            });


                                            const isBreak = classInfo?.subject_name === "Receso"

                                            return (
                                                <div
                                                    key={`${day}-${timeIndex}`}
                                                    className={`p-3 rounded-lg min-h-[80px] ${classInfo ? (isBreak ? "bg-slate-200 text-slate-700" : "bg-blue-50 text-blue-900 border-l-4 border-l-blue-500") : "bg-white border border-slate-100"} ${isBreak ? "flex items-center justify-center" : ""}`}
                                                >
                                                    {classInfo ? (
                                                        isBreak ? (
                                                            <span className="text-sm font-medium">☕ Receso</span>
                                                        ) : (
                                                            <>
                                                                <div className="font-semibold text-sm mb-1">{classInfo.subject_name}</div>
                                                                <div className="text-xs opacity-90">{classInfo.teacher_name}</div>
                                                                <div className="text-xs opacity-75 mt-0.5">{classInfo.group_name}</div>
                                                            </>
                                                        )
                                                    ) : null}
                                                </div>
                                            )
                                        })}
                                    </Fragment>
                                ))}
                            </div>


                        </div>
                    </div>
                
            </CardContent>
        </Card>
    )
}
