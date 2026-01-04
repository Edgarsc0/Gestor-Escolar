import UserController from "../../controllers/UserController";

const controller = new UserController();

export async function GET(request, { params }) {
    return controller.getUserById(request, { params });
}

export async function PUT(request, { params }) {
    return controller.updateUser(request, { params });
}

export async function DELETE(request, { params }) {
    return controller.deleteUser(request, { params });
}
