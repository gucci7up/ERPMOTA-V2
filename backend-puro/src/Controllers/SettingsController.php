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
        // Solo usuarios autenticados pueden ver o modificar configuraciones globales
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /api/settings
     * Devuelve todas las configuraciones en un formato llave: valor
     */
    public function index()
    {
        $stmt = $this->db->prepare("SELECT key_name, value FROM settings");
        $stmt->execute();
        $settings = $stmt->fetchAll();

        // Convertir array plano a un diccionario { "company_name": "...", "system_currency": "..." }
        $formatted = [];
        foreach ($settings as $setting) {
            $formatted[$setting['key_name']] = $setting['value'];
        }

        $this->jsonResponse($formatted);
    }

    /**
     * POST /api/settings
     * Actualiza múltiples configuraciones a la vez enviadas en JSON
     */
    public function update()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data || !is_array($data)) {
            $this->jsonResponse(['error' => 'Invalid JSON data'], 400);
        }

        // INSERT ... ON DUPLICATE KEY UPDATE nativo en MySQL
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("INSERT INTO settings (key_name, value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE value = VALUES(value)");

            foreach ($data as $key => $value) {
                // Prevenir que se actualice el logo por esta vía (el logo tiene su propio endpoint binario)
                if ($key === 'logo')
                    continue;

                $stmt->bindParam(':key', $key, \PDO::PARAM_STR);

                // Si es un valor nulo, lo guardamos como un string vacío o nulo
                $valStr = (string) $value;
                $stmt->bindParam(':value', $valStr, \PDO::PARAM_STR);

                $stmt->execute();
            }

            $this->db->commit();
            $this->jsonResponse(['message' => 'Settings updated successfully']);

        } catch (\Exception $e) {
            $this->db->rollBack();
            $this->jsonResponse(['error' => 'Database error', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/settings/logo
     * Subida física del logo de la empresa mediante FormData
     */
    public function uploadLogo()
    {
        if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
            $this->jsonResponse(['error' => 'No file uploaded or upload error'], 400);
        }

        $file = $_FILES['logo'];

        // Validación básica de extensión
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'svg', 'webp'];
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($extension, $allowedExtensions)) {
            $this->jsonResponse(['error' => 'Invalid file format. Use JPG, PNG, SVG or WebP'], 400);
        }

        // Generar un nombre de archivo seguro
        $newFilename = 'logo_' . time() . '.' . $extension;
        $uploadDir = __DIR__ . '/../../public/storage/logos/';

        // Crear el directorio si por alguna razón no existe
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $destination = $uploadDir . $newFilename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            $publicUrl = '/storage/logos/' . $newFilename;

            // Actualizar la ruta en la base de datos
            $stmt = $this->db->prepare("INSERT INTO settings (key_name, value) VALUES ('logo', :url) ON DUPLICATE KEY UPDATE value = VALUES(value)");
            $stmt->bindParam(':url', $publicUrl, PDO::PARAM_STR);
            $stmt->execute();

            $this->jsonResponse([
                'message' => 'Logo uploaded successfully',
                'url' => $publicUrl
            ]);
        } else {
            $this->jsonResponse(['error' => 'Failed to move uploaded file'], 500);
        }
    }
}
