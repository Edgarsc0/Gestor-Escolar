import IncidentController from "@/app/api/controllers/IncidentController";

const controller = new IncidentController();

export async function POST(request) {
    return controller.create(request);
}

export async function GET(request) {
    return controller.getAll(request);
}
