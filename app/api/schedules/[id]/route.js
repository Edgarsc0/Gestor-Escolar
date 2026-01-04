import ScheduleController from "@/app/api/controllers/ScheduleController";

export async function PUT(request, { params }) {
    const controller = new ScheduleController();
    return await controller.update(request, { params });
}

export async function DELETE(request, { params }) {
    const controller = new ScheduleController();
    return await controller.delete(request, { params });
}