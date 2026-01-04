import UserRepository from '../repository/UserRepository';
import UserRelationshipRepository from '../repository/UserRelationshipRepository';
import ActivityLogService from './ActivityLogService';
import bcrypt from "bcrypt";

export default class UploadService {
    constructor() {
        this.userRepository = new UserRepository();
        this.userRelationshipRepository = new UserRelationshipRepository();
        this.logService = new ActivityLogService();
    }

    async processUpload(rows, adminId) {
        let studentsCreated = 0;
        let tutorsCreated = 0;
        let relationshipsCreated = 0;
        let errors = 0;
        const details = [];

        for (const row of rows) {
            try {
                // Create or find tutor
                let tutor = await this.userRepository.getUserByAnyEmail(row.tutor_email);
                if (!tutor) {
                    const tutorPassword = await bcrypt.hash("temporal123", 10);
                    tutor = await this.userRepository.createUser({
                        full_name: row.tutor_name,
                        birth_date: row.tutor_dob,
                        email: row.tutor_email,
                        role: 'tutor',
                        status: 'active',
                        password_hash: tutorPassword
                    });
                    tutorsCreated++;
                }

                // Create student
                const studentPassword = await bcrypt.hash("temporal123", 10);
                const student = await this.userRepository.createUser({
                    full_name: row.student_name,
                    birth_date: row.student_dob,
                    email: row.student_email,
                    role: 'student',
                    status: 'active',
                    password_hash: studentPassword
                });
                studentsCreated++;

                // Create relationship
                await this.userRelationshipRepository.create({ student_id: student.id, tutor_id: tutor.id, relationship_type: row.relation });
                relationshipsCreated++;
            } catch (error) {
                errors++;
                details.push({ row: row.row, error: error.message });
            }
        }
        
        this.logService.logActivity(adminId, `Procesó una carga masiva. Estudiantes: ${studentsCreated}, Tutores: ${tutorsCreated}, Errores: ${errors}.`);
        return { studentsCreated, tutorsCreated, relationshipsCreated, errors, details };
    }
}