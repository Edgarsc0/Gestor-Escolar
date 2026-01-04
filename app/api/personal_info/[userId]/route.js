import PersonalInfoController from "@/app/api/controllers/PersonalInfoController";

const controller = new PersonalInfoController();

export async function GET(request, { params }) {
    return controller.getByUser(request, { params });
}

export async function PUT(request, { params }) {
    return controller.update(request, { params });
}