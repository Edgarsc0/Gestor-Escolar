import GradeController from "@/app/api/controllers/GradeController";

const controller = new GradeController();

export async function GET(request) {
    return controller.get(request);
}

export async function POST(request) {
    return controller.save(request);
}

