import GroupController from "../controllers/GroupController";

const controller = new GroupController();

export async function GET(request) {
    return controller.getAllGroups(request);
}

export async function POST(request) {
    return controller.createGroup(request);
}
