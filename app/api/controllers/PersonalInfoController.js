import { NextResponse } from "next/server";
import PersonalInfoService from "../services/PersonalInfoService";

export default class PersonalInfoController {
    constructor() {
        this.service = new PersonalInfoService();
    }

    getByUser = async (req, { params }) => {
        try {
            const { userId } = await params;
            const info = await this.service.getPersonalInfo(userId);
            return NextResponse.json(info || {});
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };

    update = async (req, { params }) => {
        try {
            const { userId } = await params;
            const body = await req.json();
            const updated = await this.service.updatePersonalInfo(userId, body);
            return NextResponse.json(updated);
        } catch (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    };
}