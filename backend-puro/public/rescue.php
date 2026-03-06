<?php

/**
 * RESCUE FILE — ELIMINAR DESPUÉS DE USAR
 */

require_once __DIR__ . '/../src/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();

    // 1. Mostrar usuarios actuales
    echo "<h2>Usuarios en la base de datos:</h2><pre>";
    $stmt = $db->query("SELECT id, nombre, email, role FROM users");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    echo "</pre>";

    // 2. Resetear contraseña del admin
    $newPassword = password_hash('Gucci1826', PASSWORD_BCRYPT);
    $update = $db->prepare("UPDATE users SET password = ? WHERE email = 'admin@motaerp.com'");
    $update->execute([$newPassword]);
    $affected = $update->rowCount();

    if ($affected > 0) {
        echo "<h3 style='color:green;'>✅ Contraseña de admin@motaerp.com actualizada a 'Gucci1826'</h3>";
    } else {
        echo "<h3 style='color:orange;'>⚠️ No se encontró el usuario. Insertando admin...</h3>";
        $insert = $db->prepare("INSERT INTO users (nombre, email, password, role) VALUES ('Administrador', 'admin@motaerp.com', ?, 'admin')");
        $insert->execute([$newPassword]);
        echo "<p style='color:green;'>✅ Usuario admin creado con ID: " . $db->lastInsertId() . "</p>";
    }

} catch (Exception $e) {
    echo "<p style='color:red;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr><p style='color:red;'><strong>⚠️ ELIMINA ESTE ARCHIVO INMEDIATAMENTE DESPUÉS DE USARLO.</strong></p>";
