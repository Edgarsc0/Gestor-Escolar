import GroupController from "../../controllers/GroupController";

const controller = new GroupController();

export async function GET(request, { params }) {
    return controller.getGroupById(request, { params });
}

export async function PUT(request, { params }) {
    return controller.updateGroup(request, { params });
}

export async function DELETE(request, { params }) {
    return controller.deleteGroup(request, { params });
}
