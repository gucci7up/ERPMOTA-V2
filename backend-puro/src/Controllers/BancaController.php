<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class BancaController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /api/bancas
     */
    public function index()
    {
        // Soporte para Soft Deletes de Laravel: excluir filas con deleted_at
        try {
            // Intentar con filtro de soft delete
            $stmt = $this->db->prepare("SELECT * FROM bancas WHERE deleted_at IS NULL ORDER BY id DESC");
            $stmt->execute();
        } catch (\Exception $e) {
            // Si deleted_at no existe, traer todo
            $stmt = $this->db->prepare("SELECT * FROM bancas ORDER BY id DESC");
            $stmt->execute();
        }
        $this->jsonResponse($stmt->fetchAll());
    }

    /**
     * POST /api/bancas
     */
    public function store()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['name'])) {
            $this->jsonResponse(['error' => 'Name is required'], 400);
        }

        $stmt = $this->db->prepare("INSERT INTO bancas (name, address, phone, status) VALUES (:name, :address, :phone, :status)");

        $address = $data['address'] ?? null;
        $phone = $data['phone'] ?? null;
        $status = $data['status'] ?? 'active';

        $stmt->bindParam(':name', $data['name'], \PDO::PARAM_STR);
        $stmt->bindParam(':address', $address, \PDO::PARAM_STR);
        $stmt->bindParam(':phone', $phone, \PDO::PARAM_STR);
        $stmt->bindParam(':status', $status, \PDO::PARAM_STR);

        if ($stmt->execute()) {
            $data['id'] = $this->db->lastInsertId();
            $this->jsonResponse(['message' => 'Banca created successfully', 'banca' => $data], 201);
        } else {
            $this->jsonResponse(['error' => 'Failed to create Banca'], 500);
        }
    }

    /**
     * PUT /api/bancas/{id}
     */
    public function update($id)
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['name'])) {
            $this->jsonResponse(['error' => 'Name is required'], 400);
        }

        $stmt = $this->db->prepare("UPDATE bancas SET name = :name, address = :address, phone = :phone, status = :status WHERE id = :id");

        $address = $data['address'] ?? null;
        $phone = $data['phone'] ?? null;
        $status = $data['status'] ?? 'active';

        $stmt->bindParam(':name', $data['name'], \PDO::PARAM_STR);
        $stmt->bindParam(':address', $address, \PDO::PARAM_STR);
        $stmt->bindParam(':phone', $phone, \PDO::PARAM_STR);
        $stmt->bindParam(':status', $status, \PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Banca updated successfully', 'banca' => array_merge(['id' => $id], $data)]);
        } else {
            $this->jsonResponse(['error' => 'Failed to update Banca'], 500);
        }
    }

    /**
     * DELETE /api/bancas/{id}
     */
    public function destroy($id)
    {
        // Soft delete compatible: usar DELETE físico (nuestro sistema no usa soft delete)
        $stmt = $this->db->prepare("DELETE FROM bancas WHERE id = :id");
        $stmt->bindParam(':id', $id, \PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Banca deleted successfully']);
        } else {
            $this->jsonResponse(['error' => 'Failed to delete Banca'], 500);
        }
    }
}
