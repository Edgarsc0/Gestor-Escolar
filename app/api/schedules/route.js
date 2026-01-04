import ScheduleController from "@/app/api/controllers/ScheduleController";

export async function POST(request) {
    const controller = new ScheduleController();
    return await controller.create(request);
}