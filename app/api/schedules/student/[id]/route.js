// /home/edgar/Proyecto ADS/proyecto_ads/app/api/schedules/student/[id]/route.js
import ScheduleController from "@/app/api/controllers/ScheduleController";

export async function GET(request, { params }) {
    const controller = new ScheduleController();
    return await controller.getStudentSchedule(request, { params });
}