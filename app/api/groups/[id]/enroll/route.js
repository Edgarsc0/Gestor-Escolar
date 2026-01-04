// app/api/groups/[id]/enroll/route.js
import GroupController from "@/app/api/controllers/GroupController";

const controller = new GroupController();

export async function POST(request, { params }) {
    return controller.enroll(request, { params });
}