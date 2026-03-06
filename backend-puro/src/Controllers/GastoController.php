<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class GastoController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /api/gastos
     */
    public function index()
    {
        $sql = "
            SELECT 
                g.id, 
                g.banca_id, 
                g.concepto, 
                g.monto, 
                g.fecha, 
                g.estado,
                b.name as banca_name
            FROM gastos g
            LEFT JOIN bancas b ON g.banca_id = b.id
            ORDER BY g.fecha DESC, g.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $this->jsonResponse($stmt->fetchAll());
    }

    /**
     * POST /api/gastos
     */
    public function store()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['banca_id']) || empty($data['concepto']) || empty($data['fecha']) || !isset($data['monto'])) {
            $this->jsonResponse(['error' => 'Faltan campos obligatorios para registrar el gasto'], 400);
        }

        $stmt = $this->db->prepare("INSERT INTO gastos (banca_id, concepto, monto, fecha, estado) VALUES (:banca_id, :concepto, :monto, :fecha, :estado)");

        $estado = $data['estado'] ?? 'Pendiente';

        $stmt->bindParam(':banca_id', $data['banca_id'], PDO::PARAM_INT);
        $stmt->bindParam(':concepto', $data['concepto'], PDO::PARAM_STR);
        $stmt->bindParam(':monto', $data['monto'], PDO::PARAM_STR);
        $stmt->bindParam(':fecha', $data['fecha'], PDO::PARAM_STR);
        $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);

        if ($stmt->execute()) {
            $data['id'] = $this->db->lastInsertId();
            $data['estado'] = $estado;
            $this->jsonResponse(['message' => 'Gasto registrado exitosamente', 'gasto' => $data], 201);
        } else {
            $this->jsonResponse(['error' => 'Error al registrar el gasto'], 500);
        }
    }

    /**
     * PUT /api/gastos/{id}
     */
    public function update($id)
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['banca_id']) || empty($data['concepto']) || empty($data['fecha']) || !isset($data['monto'])) {
            $this->jsonResponse(['error' => 'Faltan campos obligatorios para actualizar el gasto'], 400);
        }

        $stmt = $this->db->prepare("UPDATE gastos SET banca_id = :banca_id, concepto = :concepto, monto = :monto, fecha = :fecha, estado = :estado WHERE id = :id");

        $estado = $data['estado'] ?? 'Pendiente';

        $stmt->bindParam(':banca_id', $data['banca_id'], PDO::PARAM_INT);
        $stmt->bindParam(':concepto', $data['concepto'], PDO::PARAM_STR);
        $stmt->bindParam(':monto', $data['monto'], PDO::PARAM_STR);
        $stmt->bindParam(':fecha', $data['fecha'], PDO::PARAM_STR);
        $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Gasto actualizado exitosamente']);
        } else {
            $this->jsonResponse(['error' => 'Error al actualizar el gasto'], 500);
        }
    }

    /**
     * DELETE /api/gastos/{id}
     */
    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM gastos WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Gasto eliminado exitosamente']);
        } else {
            $this->jsonResponse(['error' => 'Error al eliminar el gasto'], 500);
        }
    }
}
