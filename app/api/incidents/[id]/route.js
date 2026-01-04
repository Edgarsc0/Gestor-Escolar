import IncidentController from "@/app/api/controllers/IncidentController";

const controller = new IncidentController();

export async function PUT(request, { params }) {
    return controller.updateStatus(request, { params });
}
