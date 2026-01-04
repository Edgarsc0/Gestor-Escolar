import GradeController from "@/app/api/controllers/GradeController";

export async function GET(request, { params }) {
    const controller = new GradeController();
    return await controller.getStudentKardex(request, { params });
}