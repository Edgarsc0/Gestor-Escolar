import AttendanceController from "@/app/api/controllers/AttendanceController";

export async function POST(request) {
    const controller = new AttendanceController();
    return await controller.register(request);
}

export async function GET(request) {
    const controller = new AttendanceController();
    return await controller.getSheet(request);
}
