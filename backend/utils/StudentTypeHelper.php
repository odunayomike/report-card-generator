<?php
/**
 * Student Type Helper
 * Helps differentiate between regular students and external students in CBT system
 */

class StudentTypeHelper {
    /**
     * Get student information from session
     * Works for both regular students and external students
     *
     * @return array|null ['type' => 'student'|'external_student', 'id' => int, 'school_id' => int]
     */
    public static function getStudentFromSession() {
        if (isset($_SESSION['user_type'])) {
            if ($_SESSION['user_type'] === 'student' && isset($_SESSION['student_id'])) {
                return [
                    'type' => 'student',
                    'id' => $_SESSION['student_id'],
                    'school_id' => $_SESSION['school_id'] ?? null
                ];
            } elseif ($_SESSION['user_type'] === 'external_student' && isset($_SESSION['external_student_id'])) {
                return [
                    'type' => 'external_student',
                    'id' => $_SESSION['external_student_id'],
                    'school_id' => $_SESSION['school_id'] ?? null
                ];
            }
        }
        return null;
    }

    /**
     * Check if user is authenticated as any type of student
     *
     * @return bool
     */
    public static function isAuthenticated() {
        return self::getStudentFromSession() !== null;
    }

    /**
     * Get WHERE clause for exam assignments based on student type
     *
     * @param array $studentInfo From getStudentFromSession()
     * @return array ['clause' => string, 'param' => int]
     */
    public static function getAssignmentWhereClause($studentInfo) {
        if ($studentInfo['type'] === 'student') {
            return [
                'clause' => 'ea.student_id = ?',
                'param' => $studentInfo['id']
            ];
        } else {
            return [
                'clause' => 'ea.external_student_id = ?',
                'param' => $studentInfo['id']
            ];
        }
    }

    /**
     * Get WHERE clause for student attempts based on student type
     *
     * @param array $studentInfo From getStudentFromSession()
     * @return array ['clause' => string, 'param' => int]
     */
    public static function getAttemptWhereClause($studentInfo) {
        if ($studentInfo['type'] === 'student') {
            return [
                'clause' => 'sa.student_id = ?',
                'param' => $studentInfo['id']
            ];
        } else {
            return [
                'clause' => 'sa.external_student_id = ?',
                'param' => $studentInfo['id']
            ];
        }
    }

    /**
     * Get student data for insertion into assignment/attempt tables
     *
     * @param array $studentInfo From getStudentFromSession()
     * @return array ['student_id' => int|null, 'external_student_id' => int|null]
     */
    public static function getStudentDataForInsert($studentInfo) {
        if ($studentInfo['type'] === 'student') {
            return [
                'student_id' => $studentInfo['id'],
                'external_student_id' => null
            ];
        } else {
            return [
                'student_id' => null,
                'external_student_id' => $studentInfo['id']
            ];
        }
    }

    /**
     * Get full student information from database
     *
     * @param PDO $db Database connection
     * @param array $studentInfo From getStudentFromSession()
     * @return array|null Student data
     */
    public static function getStudentDetails($db, $studentInfo) {
        if ($studentInfo['type'] === 'student') {
            $query = "SELECT s.*, sch.school_name
                      FROM students s
                      INNER JOIN schools sch ON s.school_id = sch.id
                      WHERE s.id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$studentInfo['id']]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($student) {
                $student['student_type'] = 'regular';
            }
            return $student;
        } else {
            $query = "SELECT es.*, sch.school_name
                      FROM external_students es
                      INNER JOIN schools sch ON es.school_id = sch.id
                      WHERE es.id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$studentInfo['id']]);
            $externalStudent = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($externalStudent) {
                $externalStudent['student_type'] = 'external';
                // Map external student fields to match regular student structure
                $externalStudent['current_class'] = $externalStudent['applying_for_class'];
                $externalStudent['admission_no'] = $externalStudent['exam_code'];
            }
            return $externalStudent;
        }
    }

    /**
     * Log activity for student
     *
     * @param PDO $db Database connection
     * @param array $studentInfo From getStudentFromSession()
     * @param int $examId Exam ID
     * @param string $activityType Activity type
     * @param string $details Activity details
     */
    public static function logActivity($db, $studentInfo, $examId, $activityType, $details) {
        try {
            if ($studentInfo['type'] === 'student') {
                $query = "INSERT INTO cbt_activity_log
                          (student_id, exam_id, school_id, activity_type, details, ip_address)
                          VALUES (?, ?, ?, ?, ?, ?)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $studentInfo['id'],
                    $examId,
                    $studentInfo['school_id'],
                    $activityType,
                    $details,
                    $_SERVER['REMOTE_ADDR'] ?? null
                ]);
            } else {
                $query = "INSERT INTO external_student_activity_log
                          (external_student_id, school_id, activity_type, details, ip_address)
                          VALUES (?, ?, ?, ?, ?)";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $studentInfo['id'],
                    $studentInfo['school_id'],
                    $activityType,
                    "Exam ID: $examId - $details",
                    $_SERVER['REMOTE_ADDR'] ?? null
                ]);
            }
        } catch (PDOException $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
}
?>
