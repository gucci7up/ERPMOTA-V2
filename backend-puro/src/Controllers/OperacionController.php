<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class OperacionController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /api/operaciones
     * Supports optional ?start_date=YYYY-MM-DD & end_date=YYYY-MM-DD
     */
    public function index()
    {
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        $sql = "
            SELECT 
                o.id, 
                o.fecha, 
                o.tipo, 
                o.descripcion, 
                o.monto, 
                o.banca_id,
                b.name as banca_name
            FROM operaciones o
            LEFT JOIN bancas b ON o.banca_id = b.id
        ";

        $params = [];

        // Apply date filtering if provided, otherwise default to current month or just order desc
        if ($startDate && $endDate) {
            $sql .= " WHERE o.fecha BETWEEN :start_date AND :end_date";
            $params[':start_date'] = $startDate;
            $params[':end_date'] = $endDate;
        }

        $sql .= " ORDER BY o.fecha DESC, o.id DESC";

        $stmt = $this->db->prepare($sql);

        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val, PDO::PARAM_STR);
        }

        $stmt->execute();
        $this->jsonResponse($stmt->fetchAll());
    }

    /**
     * POST /api/operaciones
     */
    public function store()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['banca_id']) || empty($data['fecha']) || empty($data['tipo']) || empty($data['descripcion']) || !isset($data['monto'])) {
            $this->jsonResponse(['error' => 'Faltan campos obligatorios para registrar la operación'], 400);
        }

        $stmt = $this->db->prepare("INSERT INTO operaciones (banca_id, fecha, tipo, descripcion, monto) VALUES (:banca_id, :fecha, :tipo, :descripcion, :monto)");

        $stmt->bindParam(':banca_id', $data['banca_id'], PDO::PARAM_INT);
        $stmt->bindParam(':fecha', $data['fecha'], PDO::PARAM_STR);
        $stmt->bindParam(':tipo', $data['tipo'], PDO::PARAM_STR);
        $stmt->bindParam(':descripcion', $data['descripcion'], PDO::PARAM_STR);
        $stmt->bindParam(':monto', $data['monto'], PDO::PARAM_STR);

        if ($stmt->execute()) {
            $data['id'] = $this->db->lastInsertId();
            $this->jsonResponse(['message' => 'Operación registrada exitosamente', 'operacion' => $data], 201);
        } else {
            $this->jsonResponse(['error' => 'Error al registrar la operación'], 500);
        }
    }

    /**
     * PUT /api/operaciones/{id}
     */
    public function update($id)
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['banca_id']) || empty($data['fecha']) || empty($data['tipo']) || empty($data['descripcion']) || !isset($data['monto'])) {
            $this->jsonResponse(['error' => 'Faltan campos obligatorios para actualizar la operación'], 400);
        }

        $stmt = $this->db->prepare("UPDATE operaciones SET banca_id = :banca_id, fecha = :fecha, tipo = :tipo, descripcion = :descripcion, monto = :monto WHERE id = :id");

        $stmt->bindParam(':banca_id', $data['banca_id'], PDO::PARAM_INT);
        $stmt->bindParam(':fecha', $data['fecha'], PDO::PARAM_STR);
        $stmt->bindParam(':tipo', $data['tipo'], PDO::PARAM_STR);
        $stmt->bindParam(':descripcion', $data['descripcion'], PDO::PARAM_STR);
        $stmt->bindParam(':monto', $data['monto'], PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Operación actualizada exitosamente']);
        } else {
            $this->jsonResponse(['error' => 'Error al actualizar la operación'], 500);
        }
    }

    /**
     * DELETE /api/operaciones/{id}
     */
    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM operaciones WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Operación eliminada exitosamente']);
        } else {
            $this->jsonResponse(['error' => 'Error al eliminar la operación'], 500);
        }
    }
}
