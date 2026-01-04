import JustificationController from "@/app/api/controllers/JustificationController";

const controller = new JustificationController();

export async function PUT(request, { params }) {
    return controller.review(request, { params });
}
