import TutorInformation from "./TutorInformation"

export default function ProfileTab({ studentId, studentName, levelSlug }) {
    return (
        <TutorInformation userId={studentId} userName={studentName} levelSlug={levelSlug} />
    )
}
