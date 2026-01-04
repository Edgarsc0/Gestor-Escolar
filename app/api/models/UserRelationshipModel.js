// app/api/models/UserRelationshipModel.js
export default class UserRelationship {
    constructor(id, student_id, tutor_id, relationship_type, extra_info = {}) {
        this.id = id;
        this.student_id = student_id;
        this.tutor_id = tutor_id;
        this.relationship_type = relationship_type;
        
        Object.assign(this, extra_info);
    }
}
