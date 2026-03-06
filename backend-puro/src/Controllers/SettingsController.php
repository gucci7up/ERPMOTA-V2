<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class SettingsController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    // GET /api/settings — returns { company_name: "...", etc }
    public function index()
    {
        // Real DB uses column `key` not `key_name`
        $stmt = $this->db->prepare("SELECT `key`, `value` FROM settings");
        $stmt->execute();
        $formatted = [];
        foreach ($stmt->fetchAll() as $row) {
            $formatted[$row['key']] = $row['value'];
        }
        $this->jsonResponse($formatted);
    }

    // POST /api/settings
    public function update()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !is_array($data)) {
            $this->jsonResponse(['error' => 'Invalid JSON data'], 400);
        }

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare("INSERT INTO settings (`key`, `value`) VALUES (:key, :value) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
            foreach ($data as $key => $value) {
                if ($key === 'logo')
                    continue;
                $valStr = (string) $value;
                $stmt->execute([':key' => $key, ':value' => $valStr]);
            }
            $this->db->commit();
            $this->jsonResponse(['message' => 'Settings updated successfully']);
        } catch (\Exception $e) {
            $this->db->rollBack();
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    // POST /api/settings/logo
    public function uploadLogo()
    {
        if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
            $this->jsonResponse(['error' => 'No file uploaded'], 400);
        }
        $file = $_FILES['logo'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'svg', 'webp'];
        if (!in_array($ext, $allowed)) {
            $this->jsonResponse(['error' => 'Invalid format'], 400);
        }
        $filename = 'logo_' . time() . '.' . $ext;
        $uploadDir = __DIR__ . '/../../public/storage/logos/';
        if (!is_dir($uploadDir))
            mkdir($uploadDir, 0755, true);
        $dest = $uploadDir . $filename;
        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $url = '/storage/logos/' . $filename;
            $stmt = $this->db->prepare("INSERT INTO settings (`key`, `value`) VALUES ('logo', :url) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
            $stmt->execute([':url' => $url]);
            $this->jsonResponse(['message' => 'Logo uploaded', 'url' => $url]);
        } else {
            $this->jsonResponse(['error' => 'Upload failed'], 500);
        }
    }
}
