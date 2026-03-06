<?php
// DIAGNOSTICO DB — ELIMINAR DESPUÉS DE USAR
require_once __DIR__ . '/../src/Config/Database.php';
try {
    $db = \App\Config\Database::getInstance()->getConnection();

    // Mostrar todas las tablas
    echo "<h2>Tablas en la DB:</h2><pre>";
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    print_r($tables);
    echo "</pre>";

    // Describir cada tabla con sus columnas y datos
    foreach ($tables as $table) {
        echo "<h3>ESTRUCTURA: $table</h3><pre>";
        $cols = $db->query("DESCRIBE `$table`")->fetchAll(PDO::FETCH_ASSOC);
        print_r($cols);
        echo "</pre>";

        echo "<h4>DATOS (primeras 5 filas): $table</h4><pre>";
        $rows = $db->query("SELECT * FROM `$table` LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
        print_r($rows);
        echo "</pre><hr>";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
