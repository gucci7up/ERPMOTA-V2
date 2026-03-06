<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class NominaController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /api/pagos-nomina
     */
    public function index()
    {
        $sql = "
            SELECT 
                p.id, 
                p.empleado_id, 
                p.monto_pagado, 
                p.fecha_pago, 
                p.periodo,
                e.name as empleado_name
            FROM pagos_nomina p
            LEFT JOIN users e ON p.empleado_id = e.id
            ORDER BY p.fecha_pago DESC, p.id DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $this->jsonResponse($stmt->fetchAll());
    }

    /**
     * POST /api/pagos-nomina
     */
    public function store()
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['empleado_id']) || empty($data['fecha_pago']) || empty($data['periodo']) || !isset($data['monto_pagado'])) {
            $this->jsonResponse(['error' => 'Faltan campos obligatorios para registrar el pago'], 400);
        }

        $stmt = $this->db->prepare("INSERT INTO pagos_nomina (empleado_id, monto_pagado, fecha_pago, periodo) VALUES (:empleado_id, :monto_pagado, :fecha_pago, :periodo)");

        $stmt->bindParam(':empleado_id', $data['empleado_id'], PDO::PARAM_INT);
        $stmt->bindParam(':monto_pagado', $data['monto_pagado'], PDO::PARAM_STR);
        $stmt->bindParam(':fecha_pago', $data['fecha_pago'], PDO::PARAM_STR);
        $stmt->bindParam(':periodo', $data['periodo'], PDO::PARAM_STR);

        if ($stmt->execute()) {
            $data['id'] = $this->db->lastInsertId();
            $this->jsonResponse(['message' => 'Pago de nómina registrado exitosamente', 'pago' => $data], 201);
        } else {
            $this->jsonResponse(['error' => 'Error al registrar el pago de nómina'], 500);
        }
    }

    /**
     * PUT /api/pagos-nomina/{id}
     */
    public function update($id)
    {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (empty($data['empleado_id']) || empty($data['fecha_pago']) || empty($data['periodo']) || !isset($data['monto_pagado'])) {
            $this->jsonResponse(['error' => 'Faltan campos obligatorios para actualizar el pago'], 400);
        }

        $stmt = $this->db->prepare("UPDATE pagos_nomina SET empleado_id = :empleado_id, monto_pagado = :monto_pagado, fecha_pago = :fecha_pago, periodo = :periodo WHERE id = :id");

        $stmt->bindParam(':empleado_id', $data['empleado_id'], PDO::PARAM_INT);
        $stmt->bindParam(':monto_pagado', $data['monto_pagado'], PDO::PARAM_STR);
        $stmt->bindParam(':fecha_pago', $data['fecha_pago'], PDO::PARAM_STR);
        $stmt->bindParam(':periodo', $data['periodo'], PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Pago de nómina actualizado exitosamente']);
        } else {
            $this->jsonResponse(['error' => 'Error al actualizar el pago de nómina'], 500);
        }
    }

    /**
     * DELETE /api/pagos-nomina/{id}
     */
    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM pagos_nomina WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $this->jsonResponse(['message' => 'Pago de nómina eliminado exitosamente']);
        } else {
            $this->jsonResponse(['error' => 'Error al eliminar el pago de nómina'], 500);
        }
    }
}
