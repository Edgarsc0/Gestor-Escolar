// app/api/academic-levels/route.js
import AcademicLevelController from "../controllers/AcademicLevelController";

const controller = new AcademicLevelController();

export async function GET(request) {
    return controller.getAll(request);
}
