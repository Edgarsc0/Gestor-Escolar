import GroupController from "@/app/api/controllers/GroupController";

const controller = new GroupController();

export async function GET(request) {
    return controller.getAllEnrollments(request);
}
