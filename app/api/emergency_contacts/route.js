import EmergencyContactController from "@/app/api/controllers/EmergencyContactController";

const controller = new EmergencyContactController();

export async function POST(request) {
    return controller.create(request);
}
