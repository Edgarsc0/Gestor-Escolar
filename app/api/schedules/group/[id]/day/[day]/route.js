import ScheduleController from "@/app/api/controllers/ScheduleController";

export async function DELETE(request, { params }) {
    const controller = new ScheduleController();
    return await controller.deleteByGroupAndDay(request, { params });
}