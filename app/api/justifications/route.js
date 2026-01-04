import JustificationController from "@/app/api/controllers/JustificationController";

const controller = new JustificationController();

export async function POST(request) {
    return controller.create(request);
}

export async function GET(request) {
    return controller.getPending(request);
}
