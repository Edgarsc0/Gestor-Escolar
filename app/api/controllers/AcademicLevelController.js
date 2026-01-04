// app/api/controllers/AcademicLevelController.js
import { NextResponse } from "next/server";
import AcademicLevelService from "../services/AcademicLevelService";

export default class AcademicLevelController {
    constructor() {
        this.service = new AcademicLevelService();
    }

    getAll = async (req) => {
        try {
            const levels = await this.service.getAll();
            return NextResponse.json(levels);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}
