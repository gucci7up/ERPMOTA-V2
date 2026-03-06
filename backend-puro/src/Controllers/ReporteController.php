<?php

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;
use PDO;

class ReporteController extends Controller
{
    private $db;

    public function __construct()
    {
        Auth::check();
        $this->db = Database::getInstance()->getConnection();
    }

    // GET /api/reportes/excel?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    public function exportExcel()
    {
        $start = $_GET['start_date'] ?? date('Y-m-01');
        $end = $_GET['end_date'] ?? date('Y-m-d');

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="reporte_' . date('Ymd_His') . '.csv"');

        $output = fopen('php://output', 'w');
        fputs($output, chr(0xEF) . chr(0xBB) . chr(0xBF)); // BOM UTF-8

        fputcsv($output, ['Fecha', 'Origen', 'Descripcion', 'Tipo', 'Monto (RD$)']);

        // 1. Operaciones (ventas_brutas como ingreso, premios+gastos como gasto)
        try {
            $stmt = $this->db->prepare("SELECT o.operation_date, b.name as banca_name, o.ventas_brutas, o.premios_pagados, o.gastos_banca, o.balance_neto FROM operaciones o LEFT JOIN bancas b ON o.banca_id = b.id WHERE o.operation_date BETWEEN :s AND :e ORDER BY o.operation_date ASC");
            $stmt->execute([':s' => $start, ':e' => $end]);
            while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
                fputcsv($output, [$r['operation_date'], $r['banca_name'], 'Ventas Brutas', 'INGRESO', $r['ventas_brutas']]);
                fputcsv($output, [$r['operation_date'], $r['banca_name'], 'Premios Pagados', 'GASTO', $r['premios_pagados']]);
                fputcsv($output, [$r['operation_date'], $r['banca_name'], 'Gastos de Banca', 'GASTO', $r['gastos_banca']]);
            }
        } catch (\Exception $e) {
        }

        // 2. Gastos Fijos
        try {
            $stmt = $this->db->prepare("SELECT g.expense_date, b.name as banca_name, g.description, g.category, g.amount FROM gastos g LEFT JOIN bancas b ON g.banca_id = b.id WHERE g.expense_date BETWEEN :s AND :e ORDER BY g.expense_date ASC");
            $stmt->execute([':s' => $start, ':e' => $end]);
            while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
                fputcsv($output, [$r['expense_date'], $r['banca_name'] ?? 'General', $r['description'] . ' (' . $r['category'] . ')', 'GASTO', $r['amount']]);
            }
        } catch (\Exception $e) {
        }

        // 3. Pagos de Nómina
        try {
            $stmt = $this->db->prepare("SELECT p.payment_date, e.name as empleado_name, p.month_year, p.net_pay FROM pagos_nomina p LEFT JOIN empleados e ON p.empleado_id = e.id WHERE p.payment_date BETWEEN :s AND :e ORDER BY p.payment_date ASC");
            $stmt->execute([':s' => $start, ':e' => $end]);
            while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
                fputcsv($output, [$r['payment_date'], 'Nómina', 'Pago a ' . $r['empleado_name'] . ' (' . $r['month_year'] . ')', 'GASTO', $r['net_pay']]);
            }
        } catch (\Exception $e) {
        }

        fclose($output);
        exit();
    }
}
