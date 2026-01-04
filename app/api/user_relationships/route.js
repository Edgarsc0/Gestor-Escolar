import UserRelationshipController from "@/app/api/controllers/UserRelationshipController";

const controller = new UserRelationshipController();

export async function POST(request) {
    return controller.create(request);
}

export async function GET(request) {
    return controller.getAll(request);
}
