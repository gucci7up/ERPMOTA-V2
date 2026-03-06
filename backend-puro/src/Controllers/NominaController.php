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

    // GET /api/pagos-nomina
    public function index()
    {
        $stmt = $this->db->prepare("
            SELECT p.*, e.name as empleado_name, b.name as banca_name
            FROM pagos_nomina p
            LEFT JOIN empleados e ON p.empleado_id = e.id
            LEFT JOIN bancas b ON p.banca_id = b.id
            ORDER BY p.payment_date DESC
        ");
        $stmt->execute();
        $this->jsonResponse($stmt->fetchAll());
    }

    // POST /api/pagos-nomina
    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['empleado_id'])) {
            $this->jsonResponse(['error' => 'empleado_id es requerido'], 400);
            return;
        }

        $base = $data['base_salary'] ?? 0;
        $ars = $data['ars_deduction'] ?? 0;
        $afp = $data['afp_deduction'] ?? 0;
        $otros = $data['other_deductions'] ?? 0;
        $bonuses = $data['bonuses'] ?? 0;
        $deducciones = $ars + $afp + $otros;
        $neto = $base - $deducciones + $bonuses;

        $stmt = $this->db->prepare("INSERT INTO pagos_nomina (empleado_id, banca_id, month_year, payment_date, base_salary, ars_deduction, afp_deduction, other_deductions, deductions, bonuses, net_pay, status) VALUES (:empleado_id, :banca_id, :month_year, :payment_date, :base_salary, :ars, :afp, :otros, :deductions, :bonuses, :net_pay, :status)");
        $stmt->execute([
            ':empleado_id' => $data['empleado_id'],
            ':banca_id' => $data['banca_id'] ?? null,
            ':month_year' => $data['month_year'] ?? date('Y-m'),
            ':payment_date' => $data['payment_date'] ?? date('Y-m-d'),
            ':base_salary' => $base,
            ':ars' => $ars,
            ':afp' => $afp,
            ':otros' => $otros,
            ':deductions' => $deducciones,
            ':bonuses' => $bonuses,
            ':net_pay' => $neto,
            ':status' => $data['status'] ?? 'Pagado',
        ]);
        $data['id'] = $this->db->lastInsertId();
        $data['net_pay'] = $neto;
        $this->jsonResponse(['message' => 'Pago de nómina registrado', 'pago' => $data], 201);
    }

    // PUT /api/pagos-nomina/{id}
    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $base = $data['base_salary'] ?? 0;
        $ars = $data['ars_deduction'] ?? 0;
        $afp = $data['afp_deduction'] ?? 0;
        $otros = $data['other_deductions'] ?? 0;
        $bonuses = $data['bonuses'] ?? 0;
        $deducciones = $ars + $afp + $otros;
        $neto = $base - $deducciones + $bonuses;

        $stmt = $this->db->prepare("UPDATE pagos_nomina SET empleado_id = :empleado_id, banca_id = :banca_id, month_year = :month_year, payment_date = :payment_date, base_salary = :base_salary, ars_deduction = :ars, afp_deduction = :afp, other_deductions = :otros, deductions = :deductions, bonuses = :bonuses, net_pay = :net_pay, status = :status WHERE id = :id");
        $stmt->execute([
            ':empleado_id' => $data['empleado_id'],
            ':banca_id' => $data['banca_id'] ?? null,
            ':month_year' => $data['month_year'] ?? date('Y-m'),
            ':payment_date' => $data['payment_date'] ?? date('Y-m-d'),
            ':base_salary' => $base,
            ':ars' => $ars,
            ':afp' => $afp,
            ':otros' => $otros,
            ':deductions' => $deducciones,
            ':bonuses' => $bonuses,
            ':net_pay' => $neto,
            ':status' => $data['status'] ?? 'Pagado',
            ':id' => $id,
        ]);
        $this->jsonResponse(['message' => 'Pago actualizado']);
    }

    // DELETE /api/pagos-nomina/{id}
    public function destroy($id)
    {
        $stmt = $this->db->prepare("DELETE FROM pagos_nomina WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $this->jsonResponse(['message' => 'Pago eliminado']);
    }
}
