"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bell, Users, AlertOctagon, Activity } from "lucide-react"
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function DashboardView({ kpiData }) {
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch('/api/admin/activity');
                if (res.ok) {
                    const data = await res.json();
                    console.log("Recent Activities:", data);
                    setRecentActivities(data);
                }
            } catch (error) {
                console.error("Error fetching recent activities:", error);
            }
        };
        fetchActivities();
    }, []);

    return (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-600">Solicitudes Pendientes</CardTitle>
                            <Bell className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-slate-900">{kpiData.pendingRequests}</div>
                            {kpiData.pendingRequests > 10 && <Badge className="bg-red-600 text-white">Alta</Badge>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-600">Alumnos Activos</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{kpiData.activeStudents.current}</div>
                       
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-600">Grupos Sin Docente</CardTitle>
                            <AlertOctagon className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-black">{kpiData.groupsWithoutTeacher}</div>
                            {kpiData.groupsWithoutTeacher > 5 && <Badge className="bg-red-100 text-red-700 border-red-200">Crítico</Badge>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-slate-600">Actividades Recientes</CardTitle>
                            <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{recentActivities.length}</div>
                        <p className="text-sm text-slate-500 mt-1">últimas 24 horas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Actividad Reciente del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead className="text-right">Tiempo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentActivities.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell className="font-medium">{activity.user_name || "Sistema"}</TableCell>
                                    <TableCell>{activity.action}</TableCell>
                                    <TableCell className="text-right text-slate-500">
                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}