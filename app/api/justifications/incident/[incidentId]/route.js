import JustificationController from "@/app/api/controllers/JustificationController";

const controller = new JustificationController();

export async function GET(request, { params }) {
    return controller.getByIncident(request, { params });
}
