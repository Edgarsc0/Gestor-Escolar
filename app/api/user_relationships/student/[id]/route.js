import UserRelationshipController from "@/app/api/controllers/UserRelationshipController";

const controller = new UserRelationshipController();

export async function GET(request, { params }) {
    return controller.getByStudent(request, { params });
}
