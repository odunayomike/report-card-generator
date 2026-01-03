<?php
/**
 * Promotion Helper Class
 * Handles automatic student promotion logic based on report card performance
 */

class PromotionHelper {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Check if student should be promoted and process promotion
     *
     * @param int $reportCardId - The report card ID that triggered the check
     * @param int $schoolId - School ID
     * @param int $studentId - Student ID from students table
     * @param string $admissionNo - Student admission number
     * @param string $currentClass - Current class from report card
     * @param string $session - Academic session
     * @param string $term - Academic term
     * @return array - Promotion result
     */
    public function checkAndPromoteStudent($reportCardId, $schoolId, $studentId, $admissionNo, $currentClass, $session, $term) {
        try {
            // Only check promotion for Third Term reports
            if (trim(strtolower($term)) !== 'third term') {
                return [
                    'promoted' => false,
                    'retained' => false,
                    'completed' => false,
                    'from_class' => $currentClass,
                    'to_class' => null,
                    'average_score' => null,
                    'reason' => 'Not a Third Term report',
                    'action' => 'none'
                ];
            }

            // Check if auto-promotion is enabled for this school
            $schoolQuery = "SELECT promotion_threshold, auto_promotion_enabled FROM schools WHERE id = ?";
            $schoolStmt = $this->db->prepare($schoolQuery);
            $schoolStmt->execute([$schoolId]);
            $school = $schoolStmt->fetch(PDO::FETCH_ASSOC);

            if (!$school || !$school['auto_promotion_enabled']) {
                return [
                    'promoted' => false,
                    'retained' => false,
                    'completed' => false,
                    'from_class' => $currentClass,
                    'to_class' => null,
                    'average_score' => null,
                    'reason' => 'Auto-promotion disabled for school',
                    'action' => 'none'
                ];
            }

            $promotionThreshold = floatval($school['promotion_threshold']);

            // Calculate student's average score from this report card
            $avgQuery = "SELECT AVG(total) as average_score, COUNT(*) as subject_count
                        FROM subjects
                        WHERE report_card_id = ?";
            $avgStmt = $this->db->prepare($avgQuery);
            $avgStmt->execute([$reportCardId]);
            $performance = $avgStmt->fetch(PDO::FETCH_ASSOC);

            $averageScore = $performance && $performance['subject_count'] > 0
                ? round(floatval($performance['average_score']), 2)
                : 0;

            // Check if student meets promotion threshold
            if ($averageScore < $promotionThreshold) {
                // Student is retained
                return $this->recordPromotion(
                    $schoolId,
                    $studentId,
                    $admissionNo,
                    $currentClass,
                    $currentClass, // Stays in same class
                    $session,
                    $term,
                    $averageScore,
                    'retained',
                    "Average score ($averageScore%) below promotion threshold ($promotionThreshold%)",
                    $reportCardId
                );
            }

            // Get next class from hierarchy
            $nextClass = $this->getNextClass($currentClass);

            if ($nextClass === null) {
                // Terminal class (e.g., SSS 3) - student has completed
                return $this->recordPromotion(
                    $schoolId,
                    $studentId,
                    $admissionNo,
                    $currentClass,
                    null,
                    $session,
                    $term,
                    $averageScore,
                    'completed',
                    "Completed terminal class with $averageScore% average",
                    $reportCardId
                );
            }

            // Promote student to next class
            $result = $this->promoteStudent($studentId, $nextClass);

            if ($result) {
                return $this->recordPromotion(
                    $schoolId,
                    $studentId,
                    $admissionNo,
                    $currentClass,
                    $nextClass,
                    $session,
                    $term,
                    $averageScore,
                    'promoted',
                    "Promoted with $averageScore% average (threshold: $promotionThreshold%)",
                    $reportCardId
                );
            } else {
                return [
                    'promoted' => false,
                    'retained' => false,
                    'completed' => false,
                    'from_class' => $currentClass,
                    'to_class' => null,
                    'average_score' => null,
                    'reason' => 'Failed to update student record',
                    'action' => 'error'
                ];
            }

        } catch (Exception $e) {
            error_log('Promotion check failed: ' . $e->getMessage());
            return [
                'promoted' => false,
                'retained' => false,
                'completed' => false,
                'from_class' => $currentClass ?? null,
                'to_class' => null,
                'average_score' => null,
                'reason' => 'Error: ' . $e->getMessage(),
                'action' => 'error'
            ];
        }
    }

    /**
     * Get the next class in the hierarchy
     *
     * @param string $currentClass - Current class name
     * @return string|null - Next class name or null if terminal
     */
    private function getNextClass($currentClass) {
        $query = "SELECT next_class, is_terminal FROM class_hierarchy WHERE class_name = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$currentClass]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            // Class not found in hierarchy, no promotion
            return false;
        }

        return $result['is_terminal'] ? null : $result['next_class'];
    }

    /**
     * Update student's current class
     *
     * @param int $studentId - Student ID
     * @param string $newClass - New class to promote to
     * @return bool - Success status
     */
    private function promoteStudent($studentId, $newClass) {
        $query = "UPDATE students
                 SET current_class = ?,
                     last_promotion_date = CURRENT_TIMESTAMP,
                     promotion_status = 'promoted',
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$newClass, $studentId]);
    }

    /**
     * Record promotion in history table
     *
     * @param int $schoolId
     * @param int $studentId
     * @param string $admissionNo
     * @param string $fromClass
     * @param string|null $toClass
     * @param string $session
     * @param string $term
     * @param float $averageScore
     * @param string $status - 'promoted', 'retained', or 'completed'
     * @param string $reason
     * @param int $reportCardId
     * @return array - Promotion result
     */
    private function recordPromotion($schoolId, $studentId, $admissionNo, $fromClass, $toClass, $session, $term, $averageScore, $status, $reason, $reportCardId) {
        $query = "INSERT INTO student_promotions
                 (school_id, student_id, student_admission_no, from_class, to_class, session, term, average_score, promotion_status, promotion_reason, report_card_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $schoolId,
            $studentId,
            $admissionNo,
            $fromClass,
            $toClass,
            $session,
            $term,
            $averageScore,
            $status,
            $reason,
            $reportCardId
        ]);

        // Update student promotion_status if retained or completed
        if ($status === 'retained') {
            $updateQuery = "UPDATE students SET promotion_status = 'retained' WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([$studentId]);
        } elseif ($status === 'completed') {
            $updateQuery = "UPDATE students SET promotion_status = 'graduated' WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([$studentId]);
        }

        return [
            'promoted' => $status === 'promoted',
            'retained' => $status === 'retained',
            'completed' => $status === 'completed',
            'from_class' => $fromClass,
            'to_class' => $toClass,
            'average_score' => $averageScore,
            'reason' => $reason,
            'action' => $status
        ];
    }

    /**
     * Get promotion history for a student
     *
     * @param int $studentId
     * @return array - Promotion history
     */
    public function getPromotionHistory($studentId) {
        $query = "SELECT * FROM student_promotions
                 WHERE student_id = ?
                 ORDER BY promoted_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get all classes from hierarchy
     *
     * @return array - Class list
     */
    public function getAllClasses() {
        $query = "SELECT * FROM class_hierarchy ORDER BY class_level ASC";
        $stmt = $this->db->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
