<?php

namespace App\Middleware;

use App\Config\Database;
use PDO;

/**
 * Guarda las sesiones PHP en MySQL para que sobrevivan reinicios del contenedor Docker.
 * Usa la tabla `sessions` que ya existe en la DB.
 */
class DbSessionHandler implements \SessionHandlerInterface
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function open($savePath, $sessionName): bool
    {
        return true;
    }
    public function close(): bool
    {
        return true;
    }

    public function read($id): string|false
    {
        try {
            $stmt = $this->db->prepare("SELECT payload FROM sessions WHERE id = :id AND last_activity > :exp LIMIT 1");
            $stmt->execute([':id' => $id, ':exp' => time() - 7200]); // 2h TTL
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ? base64_decode($row['payload']) : '';
        } catch (\Exception $e) {
            return '';
        }
    }

    public function write($id, $data): bool
    {
        try {
            $payload = base64_encode($data);
            $now = time();
            $stmt = $this->db->prepare("
                INSERT INTO sessions (id, user_id, ip_address, user_agent, payload, last_activity)
                VALUES (:id, NULL, :ip, :ua, :payload, :now)
                ON DUPLICATE KEY UPDATE payload = VALUES(payload), last_activity = VALUES(last_activity)
            ");
            $stmt->execute([
                ':id' => $id,
                ':ip' => $_SERVER['REMOTE_ADDR'] ?? '',
                ':ua' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
                ':payload' => $payload,
                ':now' => $now,
            ]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function destroy($id): bool
    {
        try {
            $this->db->prepare("DELETE FROM sessions WHERE id = :id")->execute([':id' => $id]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function gc($maxlifetime): int|false
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM sessions WHERE last_activity < :exp");
            $stmt->execute([':exp' => time() - $maxlifetime]);
            return $stmt->rowCount();
        } catch (\Exception $e) {
            return 0;
        }
    }
}
