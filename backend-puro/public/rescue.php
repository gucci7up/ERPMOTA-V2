<?php

/**
 * RESCUE FILE — ELIMINAR DESPUÉS DE USAR
 * Solo para uso de emergencia para depuración y reseteo de credenciales.
 */

require_once __DIR__ . '/../src/Config/Database.php';

use App\Config\Database;

$db = Database::connect();

// 1. Mostrar los usuarios actuales
echo "<h2>Usuarios en la base de datos:</h2><pre>";
$stmt = $db->query("SELECT id, nombre, email, role, created_at FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($users);
echo "</pre>";

// 2. Forzar actualización de contraseña del admin
$newPassword = password_hash('Gucci1826', PASSWORD_BCRYPT);
$update = $db->prepare("UPDATE users SET password = :pass WHERE email = 'admin@motaerp.com'");
$update->execute([':pass' => $newPassword]);
$affected = $update->rowCount();

echo "<h2>Reseteo de Contraseña:</h2>";
if ($affected > 0) {
    echo "<p style='color:green;'>✅ Contraseña de <strong>admin@motaerp.com</strong> actualizada exitosamente.</p>";
    echo "<p>Nuevo hash: <code>" . htmlspecialchars($newPassword) . "</code></p>";
} else {
    echo "<p style='color:red;'>❌ No se encontró ningún usuario con email: admin@motaerp.com</p>";
    echo "<p>Por favor verifica la lista de usuarios arriba e inserta el correo correcto.</p>";

    // Insertar admin si no existe
    echo "<h3>Insertando usuario admin...</h3>";
    $insert = $db->prepare("INSERT INTO users (nombre, email, password, role) VALUES ('Administrador', 'admin@motaerp.com', :pass, 'admin')");
    $insert->execute([':pass' => $newPassword]);
    $newId = $db->lastInsertId();
    echo "<p style='color:green;'>✅ Usuario admin creado con ID: {$newId}</p>";
}

echo "<hr><p style='color:red;'><strong>⚠️ ELIMINA ESTE ARCHIVO INMEDIATAMENTE DESPUÉS DE USARLO.</strong></p>";
