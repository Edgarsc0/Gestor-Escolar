import pool from "../db/config";
import querys from "../db/querys";

export default class PersonalInfoRepository {
    async create(data) {
        const { user_id, personal_email, cell_phone, additional_phone, street_address, neighborhood, postal_code, blood_type, allergies } = data;
        try {
            const result = await pool.query(querys.personalInfo.create, [user_id, personal_email, cell_phone, additional_phone, street_address, neighborhood, postal_code, blood_type, allergies]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'personal_info_pkey') {
                await pool.query(querys.personalInfo.fixSequence);
                const result = await pool.query(querys.personalInfo.create, [user_id, personal_email, cell_phone, additional_phone, street_address, neighborhood, postal_code, blood_type, allergies]);
                return result.rows[0];
            }
            throw error;
        }
    }

    async getByUserId(userId) {
        const result = await pool.query(querys.personalInfo.getByUserId, [userId]);
        return result.rows[0];
    }

    async update(userId, data) {
        const { personal_email, cell_phone, additional_phone, street_address, neighborhood, postal_code, blood_type, allergies } = data;
        const result = await pool.query(querys.personalInfo.update, [userId, personal_email, cell_phone, additional_phone, street_address, neighborhood, postal_code, blood_type, allergies]);
        return result.rows[0];
    }
}