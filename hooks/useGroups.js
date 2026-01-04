import { useState, useEffect, useCallback } from "react"

export function useGroups() {
    const [groups, setGroups] = useState([])
    const [teachers, setTeachers] = useState([])
    const [academicLevels, setAcademicLevels] = useState([])
    const [students, setStudents] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isStudentsLoading, setIsStudentsLoading] = useState(false)

    const fetchGroups = useCallback(async () => {
        try {
            const res = await fetch('/api/groups')
            if (res.ok) setGroups(await res.json())
        } catch (error) {
            console.error("Error fetching groups:", error)
        }
    }, [])

    const fetchTeachers = useCallback(async () => {
        try {
            const res = await fetch('/api/users')
            if (res.ok) {
                const users = await res.json()
                setTeachers(users.filter(u => (u.role === 'teacher' || u._role === 'teacher') && u.status === 'active'))
            }
        } catch (error) {
            console.error("Error fetching teachers:", error)
        }
    }, [])

    const fetchAcademicLevels = useCallback(async () => {
        try {
            const res = await fetch('/api/AcademicLevels');
            if (res.ok) setAcademicLevels(await res.json())
        } catch (error) {
            console.error("Error fetching academic levels:", error)
        }
    }, [])

    const fetchStudents = useCallback(async (groupId) => {
        if (!groupId) {
            setStudents([])
            return
        }
        setIsStudentsLoading(true)
        try {
            const res = await fetch(`/api/groups/${groupId}/students`)
            if (res.ok) setStudents(await res.json())
        } catch (error) {
            console.error("Error fetching students:", error)
        } finally {
            setIsStudentsLoading(false)
        }
    }, [])

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            await Promise.all([fetchGroups(), fetchTeachers(), fetchAcademicLevels()])
            setIsLoading(false)
        }
        loadData()
    }, [fetchGroups, fetchTeachers, fetchAcademicLevels])

    // CRUD Operations
    const createGroup = async (payload) => {
        const res = await fetch("/api/groups", { method: "POST", body: JSON.stringify(payload) })
        if (res.ok) await fetchGroups()
        return res.ok
    }

    const updateGroup = async (id, payload) => {
        const res = await fetch(`/api/groups/${id}`, { method: "PUT", body: JSON.stringify(payload) })
        if (res.ok) await fetchGroups()
        return res.ok
    }

    const deleteGroup = async (id) => {
        const res = await fetch(`/api/groups/${id}`, { method: "DELETE" })
        if (res.ok) await fetchGroups()
        return res.ok
    }

    const removeStudent = async (groupId, studentId) => {
        const res = await fetch(`/api/groups/${groupId}/students/${studentId}`, { method: "DELETE" })
        if (res.ok) {
            await fetchStudents(groupId)
            setGroups(prev => prev.map(g => 
                g.id === groupId ? { ...g, student_count: Math.max(0, (g.student_count || 0) - 1) } : g
            ))
        }
        return res.ok
    }

    const emptyGroup = async (groupId) => {
        const res = await fetch(`/api/groups/${groupId}/students`, { method: "DELETE" })
        if (res.ok) {
            await fetchStudents(groupId)
            setGroups(prev => prev.map(g => 
                g.id === groupId ? { ...g, student_count: 0 } : g
            ))
        }
        return res.ok
    }

    const enrollStudents = async (groupId, studentIds, leavingCounts = {}) => {
        const res = await fetch(`/api/groups/${groupId}/enroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_ids: studentIds })
        })

        if (res.ok) {
            await fetchStudents(groupId)
            setGroups(prev => prev.map(g => {
                if (g.id === groupId) {
                    return { ...g, student_count: (g.student_count || 0) + studentIds.length }
                }
                if (leavingCounts[g.id]) {
                    return { ...g, student_count: Math.max(0, (g.student_count || 0) - leavingCounts[g.id]) }
                }
                return g
            }))
        }
        return res.ok
    }

    return {
        groups, teachers, academicLevels, students,
        isLoading, isStudentsLoading,
        fetchStudents,
        createGroup, updateGroup, deleteGroup, removeStudent, emptyGroup, enrollStudents
    }
}