export default class JustificationModel {
    constructor(id, incident_id, tutor_id, reason, evidence_urls, admin_comment, reviewed_by, created_at, updated_at) {
        this.id = id;
        this.incident_id = incident_id;
        this.tutor_id = tutor_id;
        this.reason = reason;
        this.evidence_urls = evidence_urls;
        this.admin_comment = admin_comment;
        this.reviewed_by = reviewed_by;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}