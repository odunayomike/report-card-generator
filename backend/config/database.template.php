<?php
/**
 * Database Configuration
 * Uses environment variables for database connection
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // Get database credentials from environment variables
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->db_name = getenv('DB_NAME') ?: 'report_card_db';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASSWORD') ?: '';
    }

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo json_encode([
                'success' => false,
                'message' => 'Connection error: ' . $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}
