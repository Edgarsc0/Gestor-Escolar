import SubjectController from "@/app/api/controllers/SubjectController";

const controller = new SubjectController();

export async function GET(request, { params }) {
    return controller.getById(request, { params });
}

export async function PUT(request, { params }) {
    return controller.update(request, { params });
}

export async function DELETE(request, { params }) {
    return controller.delete(request, { params });
}

