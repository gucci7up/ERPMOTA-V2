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
        // Suprimir warnings de PHP para que no rompan el JSON
        error_reporting(0);

        $currentMonthStart = date('Y-m-01');
        $currentMonthEnd = date('Y-m-t');

        $totalBancas = 0;
        $totalEmpleados = 0;
        $ingresosMes = 0;
        $gastosOperaciones = 0;
        $gastosFijos = 0;
        $gastosNomina = 0;

        try {
            $stmtBancas = $this->db->query("SELECT COUNT(*) FROM bancas WHERE deleted_at IS NULL");
            $totalBancas = (int) $stmtBancas->fetchColumn();
        } catch (\Exception $e) {
            // deleted_at column doesn't exist, count without filter
            try {
                $stmtBancas = $this->db->query("SELECT COUNT(*) FROM bancas");
                $totalBancas = (int) $stmtBancas->fetchColumn();
            } catch (\Exception $e2) {
            }
        }

        try {
            $stmtEmpleados = $this->db->query("SELECT COUNT(*) FROM users");
            $totalEmpleados = (int) $stmtEmpleados->fetchColumn();
        } catch (\Exception $e) {
        }

        try {
            $stmtIngresos = $this->db->prepare("SELECT COALESCE(SUM(monto), 0) FROM operaciones WHERE tipo = 'ingreso' AND fecha BETWEEN :start AND :end");
            $stmtIngresos->execute(['start' => $currentMonthStart, 'end' => $currentMonthEnd]);
            $ingresosMes = (float) $stmtIngresos->fetchColumn();
        } catch (\Exception $e) {
        }

        try {
            $stmtGastosOp = $this->db->prepare("SELECT COALESCE(SUM(monto), 0) FROM operaciones WHERE tipo = 'gasto' AND fecha BETWEEN :start AND :end");
            $stmtGastosOp->execute(['start' => $currentMonthStart, 'end' => $currentMonthEnd]);
            $gastosOperaciones = (float) $stmtGastosOp->fetchColumn();
        } catch (\Exception $e) {
        }

        try {
            $stmtGastosFijos = $this->db->prepare("SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE estado = 'Pagado' AND fecha BETWEEN :start AND :end");
            $stmtGastosFijos->execute(['start' => $currentMonthStart, 'end' => $currentMonthEnd]);
            $gastosFijos = (float) $stmtGastosFijos->fetchColumn();
        } catch (\Exception $e) {
        }

        try {
            $stmtNomina = $this->db->prepare("SELECT COALESCE(SUM(monto_pagado), 0) FROM pagos_nomina WHERE fecha_pago BETWEEN :start AND :end");
            $stmtNomina->execute(['start' => $currentMonthStart, 'end' => $currentMonthEnd]);
            $gastosNomina = (float) $stmtNomina->fetchColumn();
        } catch (\Exception $e) {
        }

        $gastosTotalesMes = $gastosOperaciones + $gastosFijos + $gastosNomina;
        $balanceNeto = $ingresosMes - $gastosTotalesMes;

        $this->jsonResponse([
            'total_bancas' => $totalBancas,
            'total_empleados' => $totalEmpleados,
            'ingresos_mes' => $ingresosMes,
            'gastos_mes' => $gastosTotalesMes,
            'balance_neto' => $balanceNeto,
            'periodo' => date('M Y')
        ]);
    }
}
