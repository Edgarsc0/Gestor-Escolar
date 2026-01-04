import ScheduleController from "@/app/api/controllers/ScheduleController";

export async function GET(request, { params }) {
    const controller = new ScheduleController();
    return await controller.getByGroup(request, { params });
}

export async function DELETE(request, { params }) {
    const controller = new ScheduleController();
    return await controller.deleteByGroup(request, { params });
}