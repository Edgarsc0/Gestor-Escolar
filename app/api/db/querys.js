const querys = {
    users: {
        getAllUsers: "SELECT * FROM users ORDER BY id ASC",
        getUsersByRole: "SELECT * FROM users WHERE role = $1 ORDER BY id ASC",
        getUserById: "SELECT * FROM users WHERE id = $1",
        getUserByEmail: "SELECT * FROM users WHERE email = $1",
        createUser: "INSERT INTO users (full_name, birth_date, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        updateUser: "UPDATE users SET full_name = $1, birth_date = $2, role = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
        updatePassword: "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        deleteUser: "UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
        getTeacherAssignmentsGroups: "SELECT name FROM groups WHERE main_teacher_id = $1",
        fixSequence: "SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users))",
        getTeacherAssignmentsSchedules: `
            SELECT sub.name as subject_name, s.day_of_week, s.start_time, s.end_time, g.name as group_name 
            FROM schedules s 
            JOIN groups g ON s.group_id = g.id 
            LEFT JOIN subjects sub ON s.subject_id = sub.id
            WHERE s.teacher_id = $1`,
        getUserByAnyEmail: `
            SELECT u.* 
            FROM users u 
            LEFT JOIN personal_info pi ON u.id = pi.user_id 
            WHERE u.email = $1 OR pi.personal_email = $1
        `
    },
    groups: {
        getAllGroups: `
            SELECT g.*, al.name as level_name, al.slug as level_slug, u.full_name as teacher_name,
            (SELECT COUNT(*)::int FROM group_students gs WHERE gs.group_id = g.id) as student_count
            FROM groups g 
            LEFT JOIN academic_levels al ON g.academic_level_id = al.id 
            LEFT JOIN users u ON g.main_teacher_id = u.id
            ORDER BY g.id ASC
        `,
        getGroupById: `
            SELECT g.*, al.name as level_name, u.full_name as teacher_name 
            FROM groups g 
            LEFT JOIN academic_levels al ON g.academic_level_id = al.id 
            LEFT JOIN users u ON g.main_teacher_id = u.id
            WHERE g.id = $1
        `,
        createGroup: `
            INSERT INTO groups (name, academic_level_id, main_teacher_id, capacity) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `,
        updateGroup: `
            UPDATE groups 
            SET name = $1, academic_level_id = $2, main_teacher_id = $3, capacity = $4 
            WHERE id = $5 
            RETURNING *
        `,
        deleteGroup: `DELETE FROM groups WHERE id = $1 RETURNING id`,
        getStudentsByGroupId: `
            SELECT u.id, u.full_name, u.email, u.status, gs.attendance_rate 
            FROM users u 
            JOIN group_students gs ON u.id = gs.student_id 
            WHERE gs.group_id = $1
            ORDER BY u.full_name ASC
        `,
        addStudentToGroup: `INSERT INTO group_students (student_id, group_id) VALUES ($1, $2) ON CONFLICT (student_id, group_id) DO NOTHING RETURNING *`,
        removeStudentFromGroup: `DELETE FROM group_students WHERE student_id = $1 AND group_id = $2 RETURNING *`,
        getStudentCount: "SELECT COUNT(*)::int as count FROM group_students WHERE group_id = $1",
        removeAllStudentsFromGroup: "DELETE FROM group_students WHERE group_id = $1",
        bulkEnroll: `
            INSERT INTO group_students (student_id, group_id) 
            SELECT unnest($1::int[]), $2::int 
            ON CONFLICT (student_id, group_id) DO NOTHING
        `,
        removeStudentsFromOtherGroups: `
            DELETE FROM group_students 
            WHERE student_id = ANY($1::int[]) AND group_id != $2::int
        `,
        getGroupsByTeacher: `
            SELECT g.*, al.name as level_name, al.slug as level_slug
            FROM groups g
            LEFT JOIN academic_levels al ON g.academic_level_id = al.id
            WHERE g.main_teacher_id = $1
        `,
        unlinkTeacher: "UPDATE groups SET main_teacher_id = NULL WHERE main_teacher_id = $1",
        getAllStudentEnrollments: `
            SELECT gs.student_id, g.id as group_id, g.name as group_name, al.name as level_name, al.slug as level_slug
            FROM group_students gs
            JOIN groups g ON gs.group_id = g.id
            LEFT JOIN academic_levels al ON g.academic_level_id = al.id`,
        transferStudentsDelete: `DELETE FROM group_students WHERE student_id = ANY($1::bigint[]) AND group_id != $2`,
        bulkInsertBase: "INSERT INTO group_students (student_id, group_id) VALUES ",
        fixSequence: "SELECT setval(pg_get_serial_sequence('groups', 'id'), (SELECT MAX(id) FROM groups))"
    },
    academicLevels: {
        getAll: "SELECT * FROM academic_levels ORDER BY id ASC"
    },
    schedules: {
        getByGroupId: `
            SELECT s.*, u.full_name as teacher_name, sub.name as subject_name
            FROM schedules s
            LEFT JOIN users u ON s.teacher_id = u.id
            LEFT JOIN subjects sub ON s.subject_id = sub.id
            WHERE s.group_id = $1
            ORDER BY 
                CASE 
                    WHEN s.day_of_week = 'Lunes' THEN 1
                    WHEN s.day_of_week = 'Martes' THEN 2
                    WHEN s.day_of_week = 'Miércoles' THEN 3
                    WHEN s.day_of_week = 'Jueves' THEN 4
                    WHEN s.day_of_week = 'Viernes' THEN 5
                    WHEN s.day_of_week = 'Sábado' THEN 6
                    ELSE 7
                END,
                s.start_time ASC
        `,
        getByTeacherId: `
            SELECT s.*, g.name as group_name, sub.name as subject_name
            FROM schedules s 
            JOIN groups g ON s.group_id = g.id
            LEFT JOIN subjects sub ON s.subject_id = sub.id
            WHERE s.teacher_id = $1
        `,
        create: `
            INSERT INTO schedules (group_id, day_of_week, start_time, end_time, subject_id, teacher_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `,
        update: `UPDATE schedules SET day_of_week = $1, start_time = $2, end_time = $3, subject_id = $4, teacher_id = $5 WHERE id = $6 RETURNING *`,
        delete: `DELETE FROM schedules WHERE id = $1 RETURNING id`,
        getById: `SELECT * FROM schedules WHERE id = $1`,
        deleteByGroupId: `DELETE FROM schedules WHERE group_id = $1`,
        deleteByGroupIdAndDay: `DELETE FROM schedules WHERE group_id = $1 AND day_of_week = $2`,
        unlinkTeacher: "UPDATE schedules SET teacher_id = NULL WHERE teacher_id = $1",
        getByStudentId: `
            SELECT s.*, u.full_name as teacher_name, sub.name as subject_name, g.name as group_name
            FROM schedules s
            JOIN group_students gs ON s.group_id = gs.group_id
            LEFT JOIN users u ON s.teacher_id = u.id
            LEFT JOIN subjects sub ON s.subject_id = sub.id
            JOIN groups g ON s.group_id = g.id
            WHERE gs.student_id = $1
            ORDER BY 
                CASE 
                    WHEN s.day_of_week = 'Lunes' THEN 1
                    WHEN s.day_of_week = 'Martes' THEN 2
                    WHEN s.day_of_week = 'Miércoles' THEN 3
                    WHEN s.day_of_week = 'Jueves' THEN 4
                    WHEN s.day_of_week = 'Viernes' THEN 5
                    WHEN s.day_of_week = 'Sábado' THEN 6
                    ELSE 7
                END,
                s.start_time ASC`,
        fixSequence: "SELECT setval(pg_get_serial_sequence('schedules', 'id'), (SELECT MAX(id) FROM schedules))"
    },
    userRelationships: {
        create: "INSERT INTO user_relationships (student_id, tutor_id, relationship_type) VALUES ($1, $2, $3) RETURNING *",
        getByStudentId: `
            SELECT ur.*, u.full_name as tutor_name, u.email as tutor_email, u.status as tutor_status
            FROM user_relationships ur
            JOIN users u ON ur.tutor_id = u.id
            WHERE ur.student_id = $1
        `,
        getByTutorId: `
        SELECT ur.*, u.full_name as student_name, u.email as student_email, u.status as student_status,
        g.name as group_name, al.name as level_name, al.slug as level_slug
        FROM user_relationships ur
        JOIN users u ON ur.student_id = u.id
        LEFT JOIN group_students gs ON u.id = gs.student_id
        LEFT JOIN groups g ON gs.group_id = g.id
        LEFT JOIN academic_levels al ON g.academic_level_id = al.id
        WHERE ur.tutor_id = $1
    `,
        delete: "DELETE FROM user_relationships WHERE id = $1 RETURNING id",
        deleteByPair: "DELETE FROM user_relationships WHERE student_id = $1 AND tutor_id = $2 RETURNING id",
        getAllStudentIds: "SELECT DISTINCT student_id FROM user_relationships",
        getAll: "SELECT * FROM user_relationships",
        fixSequence: "SELECT setval(pg_get_serial_sequence('user_relationships', 'id'), (SELECT MAX(id) FROM user_relationships))"
    },
   personalInfo: {
        create: "INSERT INTO personal_info (user_id, personal_email, cell_phone, additional_phone, street_address, neighborhood, postal_code, blood_type, allergies) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        
        // --- CAMBIO AQUÍ ---
        getByUserId: `
            SELECT pi.*, al.name as academic_levels
            FROM personal_info pi
            LEFT JOIN group_students gs ON pi.user_id = gs.student_id
            LEFT JOIN groups g ON gs.group_id = g.id
            LEFT JOIN academic_levels al ON g.academic_level_id = al.id
            WHERE pi.user_id = $1
        `,
        // -------------------

        update: "UPDATE personal_info SET personal_email = COALESCE($2, personal_email), cell_phone = COALESCE($3, cell_phone), additional_phone = COALESCE($4, additional_phone), street_address = COALESCE($5, street_address), neighborhood = COALESCE($6, neighborhood), postal_code = COALESCE($7, postal_code), blood_type = COALESCE($8, blood_type), allergies = COALESCE($9, allergies), updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *",
        fixSequence: "SELECT setval(pg_get_serial_sequence('personal_info', 'id'), (SELECT MAX(id) FROM personal_info))"
    },
    subjects: {
        getAll: `
            SELECT s.*, al.name as academic_level_name 
            FROM subjects s 
            LEFT JOIN academic_levels al ON s.academic_level_id = al.id
            ORDER BY s.id ASC
        `,
        getById: `
            SELECT s.*, al.name as academic_level_name 
            FROM subjects s 
            LEFT JOIN academic_levels al ON s.academic_level_id = al.id
            WHERE s.id = $1
        `,
        getByAcademicLevel: `
            SELECT s.*, al.name as academic_level_name 
            FROM subjects s 
            LEFT JOIN academic_levels al ON s.academic_level_id = al.id
            WHERE s.academic_level_id = $1
            ORDER BY s.name ASC
        `,
        create: "INSERT INTO subjects (name, academic_level_id, description) VALUES ($1, $2, $3) RETURNING *",
        update: "UPDATE subjects SET name = $1, academic_level_id = $2, description = $3 WHERE id = $4 RETURNING *",
        delete: "DELETE FROM subjects WHERE id = $1 RETURNING id",
        fixSequence: "SELECT setval(pg_get_serial_sequence('subjects', 'id'), (SELECT MAX(id) FROM subjects))",
        checkUsage: `
            SELECT 
                (SELECT COUNT(*)::int FROM grades WHERE subject_id = $1) as grades_count,
                (SELECT COUNT(*)::int FROM schedules WHERE subject_id = $1) as schedules_count
        `
    },
    grades: {
        getByGroupAndSubject: `
            SELECT 
                u.id as student_id,
                u.full_name,
                g.partial_1,
                g.partial_2,
                g.partial_3,
                g.final_grade
            FROM group_students gs
            JOIN users u ON gs.student_id = u.id
            LEFT JOIN grades g ON gs.student_id = g.student_id AND g.subject_id = $2 AND g.school_cycle = $3
            WHERE gs.group_id = $1
            ORDER BY u.full_name;
        `,
        upsert: `
            INSERT INTO grades (student_id, subject_id, group_id, partial_1, partial_2, partial_3, final_grade, school_cycle)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (student_id, subject_id, school_cycle) 
            DO UPDATE SET
                partial_1 = COALESCE(EXCLUDED.partial_1, grades.partial_1),
                partial_2 = COALESCE(EXCLUDED.partial_2, grades.partial_2),
                partial_3 = COALESCE(EXCLUDED.partial_3, grades.partial_3),
                final_grade = COALESCE(EXCLUDED.final_grade, grades.final_grade),
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `,
        getByStudentId: `
            SELECT DISTINCT
                s.name as subject_name,
                grp.name as group_name,
                g.partial_1,
                g.partial_2,
                g.partial_3,
                g.final_grade
            FROM group_students gs
            JOIN groups grp ON gs.group_id = grp.id
            JOIN schedules sch ON gs.group_id = sch.group_id
            JOIN subjects s ON sch.subject_id = s.id
            LEFT JOIN grades g ON g.student_id = gs.student_id AND g.subject_id = s.id AND g.school_cycle = $2
            WHERE gs.student_id = $1
        `,
        fixSequence: "SELECT setval(pg_get_serial_sequence('grades', 'id'), (SELECT MAX(id) FROM grades))",
        getKardex: `
            SELECT 
                g.school_cycle,
                s.name as subject_name,
                g.final_grade,
                g.partial_1, g.partial_2, g.partial_3,
                grp.name as group_name
            FROM grades g
            JOIN subjects s ON g.subject_id = s.id
            LEFT JOIN groups grp ON g.group_id = grp.id
            WHERE g.student_id = $1
            ORDER BY g.school_cycle DESC, s.name ASC
        `
    },
    incidents: {
        create: `
            INSERT INTO incidents (student_id, reporter_id, type, date, description, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
        getByStudentId: `
            SELECT i.*, u.full_name as reporter_name
            FROM incidents i
            LEFT JOIN users u ON i.reporter_id = u.id
            WHERE i.student_id = $1
            ORDER BY i.date DESC;
        `,
        getAll: `
            SELECT i.*, s.full_name as student_name, r.full_name as reporter_name
            FROM incidents i
            JOIN users s ON i.student_id = s.id
            LEFT JOIN users r ON i.reporter_id = r.id
            ORDER BY i.date DESC;
        `,
        updateStatus: `
            UPDATE incidents SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `,
        fixSequence: "SELECT setval(pg_get_serial_sequence('incidents', 'id'), (SELECT MAX(id) FROM incidents))",
        getByReporterId: `
            SELECT i.*, s.full_name as student_name
            FROM incidents i
            JOIN users s ON i.student_id = s.id
            WHERE i.reporter_id = $1
            ORDER BY i.date DESC;
        `
    },
    justifications: {
        create: `
            INSERT INTO justifications (incident_id, tutor_id, reason, evidence_urls)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `,
        getByIncidentId: `SELECT * FROM justifications WHERE incident_id = $1;`,
        update: `UPDATE justifications SET admin_comment = $1, reviewed_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *;`,
        getAllPending: `
            SELECT 
                j.id, 
                j.reason, 
                j.evidence_urls, 
                j.created_at,
                i.date as incident_date, 
                i.type as incident_type,
                u.full_name as student_name,
                g.name as group_name,
                COALESCE(gs.attendance_rate, 100) as attendance_rate
            FROM justifications j
            JOIN incidents i ON j.incident_id = i.id
            JOIN users u ON i.student_id = u.id
            LEFT JOIN group_students gs ON u.id = gs.student_id
            LEFT JOIN groups g ON gs.group_id = g.id
            WHERE i.status = 'Esperando Revisión'
            ORDER BY j.created_at ASC
        `,
        fixSequence: "SELECT setval(pg_get_serial_sequence('justifications', 'id'), (SELECT MAX(id) FROM justifications))"
    },
    dashboard: {
        getStats: `
            SELECT
                (SELECT COUNT(*)::int FROM incidents WHERE status = 'Esperando Revisión') as pending_requests,
                (SELECT COUNT(*)::int FROM users WHERE role = 'student' AND status = 'active') as active_students,
                (SELECT COALESCE(SUM(capacity), 0)::int FROM groups) as total_capacity,
                (SELECT COUNT(*)::int FROM groups WHERE main_teacher_id IS NULL) as groups_without_teacher
        `
    },
    activityLogs: {
        create: `
            INSERT INTO activity_logs (user_id, action) VALUES ($1, $2) RETURNING *;
        `,
        getRecent: `
            SELECT l.*, u.full_name as user_name FROM activity_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 50;
        `
    }
};

export default querys;