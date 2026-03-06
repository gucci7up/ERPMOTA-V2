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

    public function index()
    {
        error_reporting(0);

        $start = date('Y-m-01');
        $end = date('Y-m-t');

        $totalBancas = 0;
        $totalEmpleados = 0;
        $totalVentas = 0;
        $totalPremios = 0;
        $totalGastosBanca = 0;
        $totalGastosFijos = 0;
        $totalNomina = 0;

        try {
            $totalBancas = (int) $this->db->query("SELECT COUNT(*) FROM bancas")->fetchColumn();
        } catch (\Exception $e) {
        }

        try {
            $totalEmpleados = (int) $this->db->query("SELECT COUNT(*) FROM empleados WHERE status = 'Activo'")->fetchColumn();
        } catch (\Exception $e) {
        }

        try {
            $stmt = $this->db->prepare("SELECT COALESCE(SUM(ventas_brutas),0), COALESCE(SUM(premios_pagados),0), COALESCE(SUM(gastos_banca),0) FROM operaciones WHERE operation_date BETWEEN :s AND :e");
            $stmt->execute([':s' => $start, ':e' => $end]);
            [$totalVentas, $totalPremios, $totalGastosBanca] = $stmt->fetch(PDO::FETCH_NUM);
            $totalVentas = (float) $totalVentas;
            $totalPremios = (float) $totalPremios;
            $totalGastosBanca = (float) $totalGastosBanca;
        } catch (\Exception $e) {
        }

        try {
            $stmt = $this->db->prepare("SELECT COALESCE(SUM(amount),0) FROM gastos WHERE expense_date BETWEEN :s AND :e");
            $stmt->execute([':s' => $start, ':e' => $end]);
            $totalGastosFijos = (float) $stmt->fetchColumn();
        } catch (\Exception $e) {
        }

        try {
            $stmt = $this->db->prepare("SELECT COALESCE(SUM(net_pay),0) FROM pagos_nomina WHERE payment_date BETWEEN :s AND :e");
            $stmt->execute([':s' => $start, ':e' => $end]);
            $totalNomina = (float) $stmt->fetchColumn();
        } catch (\Exception $e) {
        }

        $ingresosMes = $totalVentas;
        $gastosMes = $totalPremios + $totalGastosBanca + $totalGastosFijos + $totalNomina;
        $balanceNeto = $ingresosMes - $gastosMes;

        $this->jsonResponse([
            'total_bancas' => $totalBancas,
            'total_empleados' => $totalEmpleados,
            'ingresos_mes' => $ingresosMes,
            'gastos_mes' => $gastosMes,
            'balance_neto' => $balanceNeto,
            'periodo' => date('F Y'),
        ]);
    }
}
