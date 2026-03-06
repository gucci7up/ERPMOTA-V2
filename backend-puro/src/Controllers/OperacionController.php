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

    // GET /api/operaciones
    public function index()
    {
        $params = [];
        $where = [];

        if (!empty($_GET['start_date'])) {
            $where[] = "o.operation_date >= :start";
            $params[':start'] = $_GET['start_date'];
        }
        if (!empty($_GET['end_date'])) {
            $where[] = "o.operation_date <= :end";
            $params[':end'] = $_GET['end_date'];
        }
        if (!empty($_GET['banca_id'])) {
            $where[] = "o.banca_id = :banca_id";
            $params[':banca_id'] = $_GET['banca_id'];
        }

        $sql = "SELECT o.*, b.name as banca_name FROM operaciones o LEFT JOIN bancas b ON o.banca_id = b.id";
        if ($where)
            $sql .= " WHERE " . implode(" AND ", $where);
        $sql .= " ORDER BY o.operation_date DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        // Calcular totales
        $totalVentas = array_sum(array_column($rows, 'ventas_brutas'));
        $totalPremios = array_sum(array_column($rows, 'premios_pagados'));
        $totalGastos = array_sum(array_column($rows, 'gastos_banca'));
        $totalNeto = array_sum(array_column($rows, 'balance_neto'));

        $this->jsonResponse([
            'data' => $rows,
            'total_ventas' => (float) $totalVentas,
            'total_premios' => (float) $totalPremios,
            'total_gastos' => (float) $totalGastos,
            'balance_neto' => (float) $totalNeto,
        ]);
    }

    // POST /api/operaciones
    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['banca_id']) || empty($data['operation_date'])) {
            $this->jsonResponse(['error' => 'banca_id y operation_date son requeridos'], 400);
            return;
        }

        $ventas = $data['ventas_brutas'] ?? 0;
        $premios = $data['premios_pagados'] ?? 0;
        $gastos = $data['gastos_banca'] ?? 0;
        $neto = $ventas - $premios - $gastos;

        $stmt = $this->db->prepare("INSERT INTO operaciones (banca_id, operation_date, ventas_brutas, premios_pagados, gastos_banca, balance_neto) VALUES (:banca_id, :fecha, :ventas, :premios, :gastos, :neto)");
        $stmt->execute([
            ':banca_id' => $data['banca_id'],
            ':fecha' => $data['operation_date'],
            ':ventas' => $ventas,
            ':premios' => $premios,
            ':gastos' => $gastos,
            ':neto' => $neto,
        ]);
        $data['id'] = $this->db->lastInsertId();
        $data['balance_neto'] = $neto;
        $this->jsonResponse(['message' => 'Operación registrada', 'operacion' => $data], 201);
    }

    // PUT /api/operaciones/{id}
    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $ventas = $data['ventas_brutas'] ?? 0;
        $premios = $data['premios_pagados'] ?? 0;
        $gastos = $data['gastos_banca'] ?? 0;
        $neto = $ventas - $premios - $gastos;

        $stmt = $this->db->prepare("UPDATE operaciones SET banca_id = :banca_id, operation_date = :fecha, ventas_brutas = :ventas, premios_pagados = :premios, gastos_banca = :gastos, balance_neto = :neto WHERE id = :id");
        $stmt->execute([
            ':banca_id' => $data['banca_id'],
            ':fecha' => $data['operation_date'],
            ':ventas' => $ventas,
            ':premios' => $premios,
            ':gastos' => $gastos,
            ':neto' => $neto,
            ':id' => $id,
        ]);
        $this->jsonResponse(['message' => 'Operación actualizada']);
    }

    // DELETE /api/operaciones/{id}
    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM operaciones WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $this->jsonResponse(['message' => 'Operación eliminada']);
    }
}
