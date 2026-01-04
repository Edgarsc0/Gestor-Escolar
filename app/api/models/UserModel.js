import bcypt from "bcrypt";

export default class User {

    constructor(id, full_name, email, password_hash, role, status = 'active', created_at, updated_at) {
        this.id = id;
        this.full_name = full_name;
        this.email = email;
        this.password_hash = password_hash;
        this.role = role;
        this.status = status;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    get full_name() {
        return this.full_name;
    }

    set full_name(full_name) {
        this._full_name = full_name;
    }

    get email() {
        return this._email;
    }

    get role() {
        return this.role;
    }

    set  role(role) {        
        this._role = role;
    }

    get isAdmin() {
        return this.role === 'admin';
    }

    get isTutor() {
        return this.role === 'tutor';
    }

    get created_at() {
        return this.created_at;
    }

    set created_at(created_at) {
        this._created_at = created_at;
    }

    set email(email) {
        if (!/\S+@\S+\.\S+/.test(email)) {
            throw new Error("Invalid email format");
        }
        this._email = email;
    }

    async verifyPassword(password) {
        return await bcypt.compare(password, this.password_hash);
    }

}