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

    /**
     * GET /api/reportes/excel
     * Uses fputcsv to stream a CSV directly to the browser
     */
    public function exportExcel()
    {
        $startDate = $_GET['start_date'] ?? '1970-01-01';
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // Modificamos las cabeceras para forzar la descarga de un CSV
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="reporte_financiero_' . date('Ymd_His') . '.csv"');

        // Abrimos la salida estandar nativa de PHP para escribir directo
        $output = fopen('php://output', 'w');

        // UTF-8 BOM para que Excel lea tildes correctamente
        fputs($output, $bom = (chr(0xEF) . chr(0xBB) . chr(0xBF)));

        // Escribimos los headers de las columnas
        fputcsv($output, ['Fecha', 'Origen', 'Concepto/Descripcion', 'Tipo', 'Monto (RD$)']);

        // 1. Obtener Operaciones (Ingresos y Gastos Variables)
        $sqlOperaciones = "
            SELECT fecha, 'Operaciones (Variable)' as origen, descripcion, tipo, monto 
            FROM operaciones 
            WHERE fecha BETWEEN :start AND :end
            ORDER BY fecha ASC
        ";
        $stmtOp = $this->db->prepare($sqlOperaciones);
        $stmtOp->execute(['start' => $startDate, 'end' => $endDate]);

        while ($row = $stmtOp->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, [
                $row['fecha'],
                $row['origen'],
                $row['descripcion'],
                strtoupper($row['tipo']),
                $row['monto']
            ]);
        }

        // 2. Obtener Gastos Fijos (Solo Pagados)
        $sqlGastos = "
            SELECT fecha, 'Gastos Fijos' as origen, concepto as descripcion, 'GASTO' as tipo, monto 
            FROM gastos 
            WHERE estado = 'Pagado' AND fecha BETWEEN :start AND :end
            ORDER BY fecha ASC
        ";
        $stmtGas = $this->db->prepare($sqlGastos);
        $stmtGas->execute(['start' => $startDate, 'end' => $endDate]);

        while ($row = $stmtGas->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, [
                $row['fecha'],
                $row['origen'],
                $row['descripcion'],
                $row['tipo'],
                $row['monto']
            ]);
        }

        // 3. Obtener Pagos de Nómina
        $sqlNomina = "
            SELECT n.fecha_pago as fecha, 'Nómina' as origen, concat('Pago a ', u.name, ' (', n.periodo, ')') as descripcion, 'GASTO' as tipo, n.monto_pagado as monto 
            FROM pagos_nomina n
            JOIN users u ON n.empleado_id = u.id
            WHERE n.fecha_pago BETWEEN :start AND :end
            ORDER BY n.fecha_pago ASC
        ";
        $stmtNom = $this->db->prepare($sqlNomina);
        $stmtNom->execute(['start' => $startDate, 'end' => $endDate]);

        while ($row = $stmtNom->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, [
                $row['fecha'],
                $row['origen'],
                $row['descripcion'],
                $row['tipo'],
                $row['monto']
            ]);
        }

        // Cerramos el flujo
        fclose($output);
        exit(); // Asegurarnos de no imprimir nada más después de generar el CSV
    }
}
