"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, AlertTriangle, Clock } from "lucide-react"


const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

export default function DashboardKPIs({ subjects = [], scheduleData = [], incidents = [] }) {
    const [average, setAverage] = useState(null);
    const [nextClass, setNextClass] = useState(null);

    
    useEffect(() => {
        const gradedSubjects = subjects.filter(s => s.final != null && !isNaN(s.final));
        if (gradedSubjects.length > 0) {
            const total = gradedSubjects.reduce((acc, s) => acc + parseFloat(s.final), 0);
            setAverage(total / gradedSubjects.length);
        } else {
            setAverage(null);
        }
    }, [subjects]);

    
    useEffect(() => {
        if (scheduleData.length === 0) {
            setNextClass(null);
            return;
        }

        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const schoolDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        const now = new Date();
        const currentDayName = daysOfWeek[now.getDay()];
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        
        const todayClasses = scheduleData
            .filter(c => c.day_of_week === currentDayName)
            .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

        const upcomingToday = todayClasses.find(c => timeToMinutes(c.start_time) > currentTimeInMinutes);

        if (upcomingToday) {
            setNextClass(upcomingToday);
            return;
        }

        
        const currentDayIndex = schoolDays.indexOf(currentDayName);
        for (let i = 1; i <= schoolDays.length; i++) {
            const nextDayIndex = (currentDayIndex + i) % schoolDays.length;
            const nextDayName = schoolDays[nextDayIndex];
            
            const nextDayClasses = scheduleData
                .filter(c => c.day_of_week === nextDayName)
                .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

            if (nextDayClasses.length > 0) {
                setNextClass(nextDayClasses[0]);
                return;
            }
        }

        
        setNextClass(null);

    }, [scheduleData]);

    const activeIncidents = incidents.filter(i => i.status === 'Pendiente').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Card 1: Academic */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio Actual</CardTitle>
                    <GraduationCap className={`h-5 w-5 ${average ? 'text-emerald-500' : 'text-slate-400'}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{average ? average.toFixed(1) : '--'}</div>
                    {average != null ? (
                        <>
                            <Progress value={average * 10} className="mt-3 [&>div]:bg-emerald-500" />
                            <p className="text-xs text-slate-600 mt-2">{Math.round(average * 10)}% de rendimiento</p>
                        </>
                    ) : (
                        <p className="text-xs text-slate-600 mt-3">Sin datos suficientes</p>
                    )}
                </CardContent>
            </Card>

            {/* Card 2: Behavior */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Incidencias Activas</CardTitle>
                    <AlertTriangle className={`h-5 w-5 ${activeIncidents > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold ${activeIncidents > 0 ? 'text-amber-500' : 'text-slate-900'}`}>{activeIncidents}</div>
                    <p className="text-xs text-slate-600 mt-3">{activeIncidents > 0 ? 'Requieren atención' : 'Sin incidencias pendientes'}</p>
                </CardContent>
            </Card>

            {/* Card 3: Schedule */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Próxima Clase</CardTitle>
                    <Clock className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-semibold text-slate-900">{nextClass?.subject_name || 'Sin clases'}</div>
                    <p className="text-sm text-slate-600 mt-1">
                        {nextClass ? `${nextClass.day_of_week}, ${nextClass.start_time.substring(0, 5)}` : 'Horario no disponible'}
                    </p>
                </CardContent>
            </Card>

        </div>
    )
}
