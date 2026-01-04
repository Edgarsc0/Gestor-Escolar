import SubjectController from "@/app/api/controllers/SubjectController";

const controller = new SubjectController();

export async function GET(request) {
    return controller.getAll(request);
}

export async function POST(request) {
    return controller.create(request);
}

