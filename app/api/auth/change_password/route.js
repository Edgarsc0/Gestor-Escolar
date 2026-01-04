import UserController from "@/app/api/controllers/UserController";

const controller = new UserController();

export async function POST(request) {
    return controller.changePassword(request);
}
