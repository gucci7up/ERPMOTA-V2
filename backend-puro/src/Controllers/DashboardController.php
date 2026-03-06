<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class DashboardController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /api/dashboard
     */
    public function index()
    {
        $currentMonthStart = date('Y-m-01');
        $currentMonthEnd = date('Y-m-t');

        // Total Bancas
        $stmtBancas = $this->db->query("SELECT COUNT(*) FROM bancas");
        $totalBancas = $stmtBancas->fetchColumn();

        // Total Empleados
        $stmtEmpleados = $this->db->query("SELECT COUNT(*) FROM users WHERE role = 'empleado'");
        $totalEmpleados = $stmtEmpleados->fetchColumn();

        // Ingresos del Mes (Operaciones tipo='ingreso')
        $stmtIngresos = $this->db->prepare("SELECT SUM(monto) FROM operaciones WHERE tipo = 'ingreso' AND fecha BETWEEN :start AND :end");
        $stmtIngresos->execute(['start' => $currentMonthStart, 'end' => $currentMonthEnd]);
        $ingresosMes = $stmtIngresos->fetchColumn() ?: 0;

        // Gastos del mes = Operaciones (tipo='gasto') + Gastos Fijos (Pagados) + Pagos Nomina
        $stmtGastosOp = $this->db->prepare("SELECT SUM(monto) FROM operaciones WHERE tipo = 'gasto' AND fecha BETWEEN :start AND :end");
        $stmtGastosOp->execute(['start' => $currentMonthStart, 'end' => $currentMonthEnd]);
        $gastosOperaciones = $stmtGastosOp->fetchColumn() ?: 0;

        $stmtGastosFijos = $this->db->prepare("SELECT SUM(monto) FROM gastos WHERE estado = 'Pagado' AND fecha BETWEEN :start AND :end");
        $stmtGastosFijos->execute(['start' => $currentMonthStart, 'end' => $currentMonthEnd]);
        $gastosFijos = $stmtGastosFijos->fetchColumn() ?: 0;

        $stmtNomina = $this->db->prepare("SELECT SUM(monto_pagado) FROM pagos_nomina WHERE fecha_pago BETWEEN :start AND :end");
        $stmtNomina->execute(['start' => $currentMonthStart, 'end' => $currentMonthEnd]);
        $gastosNomina = $stmtNomina->fetchColumn() ?: 0;

        $gastosTotalesMes = $gastosOperaciones + $gastosFijos + $gastosNomina;
        $balanceNeto = $ingresosMes - $gastosTotalesMes;

        $this->jsonResponse([
            'total_bancas' => (int) $totalBancas,
            'total_empleados' => (int) $totalEmpleados,
            'ingresos_mes' => (float) $ingresosMes,
            'gastos_mes' => (float) $gastosTotalesMes,
            'balance_neto' => (float) $balanceNeto,
            'periodo' => date('M Y')
        ]);
    }
}
