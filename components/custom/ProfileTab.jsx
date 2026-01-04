import TutorInformation from "./TutorInformation"

export default function ProfileTab({ studentId, studentName }) {
    return (
        <TutorInformation userId={studentId} userName={studentName} />
    )
}
