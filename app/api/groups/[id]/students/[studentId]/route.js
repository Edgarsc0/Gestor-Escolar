import GroupController from "@/app/api/controllers/GroupController";

const controller = new GroupController();

export async function DELETE(request, { params }) {
    return controller.removeStudent(request, { params });
}