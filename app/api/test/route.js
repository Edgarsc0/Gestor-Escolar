import { NextResponse } from "next/server";
import { pool } from "../db/config";

//Trae todos los usuarios de la base de datos
export async function GET(req) {
    const response = await pool.query("SELECT * FROM users");
    return NextResponse.json(response.rows);
}