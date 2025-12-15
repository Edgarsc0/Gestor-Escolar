import { Fragment } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ScheduleTab({ schedule }) {
    const getSubjectColor = (subject) => {
        if (subject === "Receso") return "bg-slate-200 text-slate-700"
        const colors = {
            Matemáticas: "bg-blue-100 text-blue-700 border-l-4 border-l-blue-500",
            Español: "bg-emerald-100 text-emerald-700 border-l-4 border-l-emerald-500",
            Ciencias: "bg-purple-100 text-purple-700 border-l-4 border-l-purple-500",
            Historia: "bg-amber-100 text-amber-700 border-l-4 border-l-amber-500",
            Inglés: "bg-rose-100 text-rose-700 border-l-4 border-l-rose-500",
            "Ed. Física": "bg-green-100 text-green-700 border-l-4 border-l-green-500",
            Arte: "bg-pink-100 text-pink-700 border-l-4 border-l-pink-500",
            Música: "bg-indigo-100 text-indigo-700 border-l-4 border-l-indigo-500",
            Computación: "bg-cyan-100 text-cyan-700 border-l-4 border-l-cyan-500",
            Biblioteca: "bg-orange-100 text-orange-700 border-l-4 border-l-orange-500",
        }
        return colors[subject] || "bg-slate-100 text-slate-700 border-l-4 border-l-slate-500"
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Horario de Clases</CardTitle>
                <CardDescription>Horario semanal completo del alumno</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Schedule Grid */}
                        <div className="grid grid-cols-6 gap-2">
                            {/* Header Row */}
                            <div className="font-semibold text-sm text-slate-700 p-3 bg-slate-100 rounded-lg text-center">
                                Hora
                            </div>
                            {schedule.days.map((day) => (
                                <div
                                    key={day}
                                    className="font-semibold text-sm text-slate-700 p-3 bg-slate-100 rounded-lg text-center"
                                >
                                    {day}
                                </div>
                            ))}

                            {/* Schedule Rows */}
                            {schedule.timeSlots.map((time, timeIndex) => (
                                <Fragment key={time}>
                                    {/* Time Column */}
                                    <div
                                        className="text-xs text-slate-600 p-3 bg-slate-50 rounded-lg flex items-center justify-center font-medium"
                                    >
                                        {time}
                                    </div>
                                    {/* Class Cells */}
                                    {schedule.days.map((day) => {
                                        const classInfo = schedule.classes[day][timeIndex]
                                        const isBreak = classInfo.subject === "Receso"

                                        return (
                                            <div
                                                key={`${day}-${timeIndex}`}
                                                className={`p-3 rounded-lg ${getSubjectColor(classInfo.subject)} ${isBreak ? "flex items-center justify-center" : ""
                                                    }`}
                                            >
                                                {isBreak ? (
                                                    <span className="text-sm font-medium">☕ Receso</span>
                                                ) : (
                                                    <>
                                                        <div className="font-semibold text-sm mb-1">{classInfo.subject}</div>
                                                        <div className="text-xs opacity-90">{classInfo.teacher}</div>
                                                        <div className="text-xs opacity-75 mt-1">📍 {classInfo.room}</div>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })}
                                </Fragment>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Leyenda de Materias</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {[
                                    "Matemáticas",
                                    "Español",
                                    "Ciencias",
                                    "Historia",
                                    "Inglés",
                                    "Ed. Física",
                                    "Arte",
                                    "Música",
                                    "Computación",
                                    "Biblioteca",
                                ].map((subject) => (
                                    <div key={subject} className={`p-2 rounded text-xs font-medium ${getSubjectColor(subject)}`}>
                                        {subject}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
