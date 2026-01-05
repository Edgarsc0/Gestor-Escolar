import EmergencyContactController from "@/app/api/controllers/EmergencyContactController";

const controller = new EmergencyContactController();

export async function PUT(request, { params }) {
    return controller.update(request, { params });
}

export async function DELETE(request, { params }) {
    return controller.delete(request, { params });
}
