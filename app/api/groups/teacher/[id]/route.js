import { NextResponse } from "next/server";
import pool from "@/app/api/db/config";
import querys from "@/app/api/db/querys";

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const res = await pool.query(querys.groups.getGroupsByTeacher, [id]);
        return NextResponse.json(res.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await pool.query(querys.groups.unlinkTeacher, [id]);
        return NextResponse.json({ message: "Unlinked" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
