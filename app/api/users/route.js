import UserController from "../controllers/UserController";

const controller = new UserController();

export async function GET(request) {
    return controller.getAllUsers(request);
}

export async function POST(request) {
    return controller.createUser(request);
}
