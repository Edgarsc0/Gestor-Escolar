import { NextResponse } from "next/server";
import pool from "@/app/api/db/config";
import querys from "@/app/api/db/querys";
import bcrypt from "bcrypt";


const generatePassword = (fullName) => {
    if (!fullName) return "temporal123";
    const parts = fullName.trim().split(/\s+/);

    let password = "temporal123";
    if (parts.length >= 3) {
        
        const paternal = parts[parts.length - 2];
        const maternal = parts[parts.length - 1];
        if (paternal.length >= 4 && maternal.length >= 4) {
            password = `${paternal.substring(0, 4)}${maternal.substring(0, 4)}`.toLowerCase();
        } else {
            password = `${paternal}${maternal}`.toLowerCase();
        }
    } else if (parts.length === 2) {
        
        const paternal = parts[1];
        const fragment = paternal.substring(0, 4).toLowerCase();
        password = `${fragment}${fragment}`;
    }
    return password;
};

export async function POST(request) {
    const { rows } = await request.json();
    const results = {
        studentsCreated: 0,
        tutorsCreated: 0,
        relationshipsCreated: 0,
        errors: 0,
        details: []
    };

    const saltRounds = 10;

    for (const row of rows) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            
            let studentId;
            
            let studentQuery = "SELECT id FROM users WHERE full_name = $1 AND role = 'student'";
            let studentParams = [row.student_name];

            if (row.student_email) {
                studentQuery = "SELECT id FROM users WHERE email = $1";
                studentParams = [row.student_email];
            }

            const existingStudent = await client.query(studentQuery, studentParams);

            if (existingStudent.rows.length > 0) {
                studentId = existingStudent.rows[0].id;
            } else {
                const studentPass = await bcrypt.hash(generatePassword(row.student_name), saltRounds);
                const newStudent = await client.query(
                    querys.users.createUser,
                    [row.student_name, row.student_dob || '2010-01-01', studentPass, 'student', 'active']
                );
                studentId = newStudent.rows[0].id;
                results.studentsCreated++;
            }

            
            let tutorId;
            let tutorQuery = "SELECT id FROM users WHERE full_name = $1 AND role = 'tutor'";
            let tutorParams = [row.tutor_name];

            if (row.tutor_email) {
                tutorQuery = "SELECT id FROM users WHERE email = $1";
                tutorParams = [row.tutor_email];
            }

            const existingTutor = await client.query(tutorQuery, tutorParams);

            if (existingTutor.rows.length > 0) {
                tutorId = existingTutor.rows[0].id;
            } else {
                const tutorPass = await bcrypt.hash(generatePassword(row.tutor_name), saltRounds);
                const newTutor = await client.query(
                    querys.users.createUser,
                    [row.tutor_name, row.tutor_dob || '1980-01-01', tutorPass, 'tutor', 'active']
                );
                tutorId = newTutor.rows[0].id;
                results.tutorsCreated++;
            }

           
            const existingRel = await client.query(
                "SELECT id FROM user_relationships WHERE student_id = $1 AND tutor_id = $2",
                [studentId, tutorId]
            );

            if (existingRel.rows.length === 0) {
                await client.query(querys.userRelationships.create, [studentId, tutorId, row.relation]);
                results.relationshipsCreated++;
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            console.error("Error processing row:", row, e);
            results.errors++;
            results.details.push({ row: row.row, error: e.message });
        } finally {
            client.release();
        }
    }

    return NextResponse.json(results);
}
