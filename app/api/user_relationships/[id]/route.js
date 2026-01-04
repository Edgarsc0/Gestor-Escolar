import UserRelationshipController from "@/app/api/controllers/UserRelationshipController";

const controller = new UserRelationshipController();

export async function DELETE(request, { params }) {
    return controller.delete(request, { params });
}