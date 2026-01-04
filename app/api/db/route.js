import DashboardController from "@/app/api/controllers/DashboardController";

export async function GET(request) {
    const controller = new DashboardController();
    return await controller.getRecentActivity(request);
}