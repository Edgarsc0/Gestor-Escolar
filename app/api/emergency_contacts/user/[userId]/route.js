import EmergencyContactController from "@/app/api/controllers/EmergencyContactController";

const controller = new EmergencyContactController();

export async function GET(request, { params }) {
    return controller.getByUser(request, { params });
}
