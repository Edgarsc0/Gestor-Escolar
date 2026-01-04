import GroupController from "@/app/api/controllers/GroupController";

const controller = new GroupController();

export async function GET(request, { params }) {
    return controller.getGroupStudents(request, { params });
}

export async function POST(request, { params }) {
    return controller.addStudent(request, { params });
}

export async function DELETE(request, { params }) {
    return controller.emptyGroup(request, { params });
}